import { ApiService } from '@/cli/utilities/api/api-service';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import {
  type ApplicationTokenPair,
  ConfigService,
} from '@/cli/utilities/config/config-service';
import { generate } from '@genql/cli';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import { join, resolve } from 'path';
import {
  DEFAULT_API_KEY_NAME,
  DEFAULT_API_URL_NAME,
  OUTPUT_DIR,
} from 'twenty-shared/application';

export const GENERATED_FOLDER_NAME = 'generated';

export class ClientService {
  private static readonly TOKEN_RENEWAL_WINDOW_IN_MILLISECONDS = 60_000;

  private configService: ConfigService;
  private apiService: ApiService;

  constructor() {
    this.configService = new ConfigService();
    this.apiService = new ApiService();
  }

  async generate(appPath: string): Promise<void> {
    const outputPath = join(appPath, GENERATED_FOLDER_NAME);

    console.log(chalk.blue('📦 Generating Twenty client...'));
    console.log(chalk.gray(`📁 Output Path: ${outputPath}`));
    console.log('');
    const config = await this.configService.getConfig();

    const url = config.apiUrl;
    const token = config.apiKey;

    if (!url || !token) {
      console.log(
        chalk.yellow(
          '⚠️  Skipping Client generation: API URL or token not configured',
        ),
      );
      return;
    }

    console.log(chalk.gray(`API URL: ${url}`));
    console.log(chalk.gray(`Output: ${outputPath}`));

    const applicationUniversalIdentifier =
      await this.getApplicationUniversalIdentifier(appPath);
    const applicationTokenPair = applicationUniversalIdentifier
      ? await this.getValidApplicationTokenPair(applicationUniversalIdentifier)
      : null;

    if (applicationTokenPair) {
      console.log(
        chalk.gray('Using application access token to introspect schema'),
      );
    } else if (applicationUniversalIdentifier) {
      console.log(
        chalk.yellow(
          '⚠️  Could not resolve application token pair, falling back to API key schema introspection',
        ),
      );
    }

    const getSchemaResponse = await this.apiService.getSchema(
      applicationTokenPair
        ? {
            authorizationToken:
              applicationTokenPair.applicationAccessToken.token,
          }
        : undefined,
    );

    if (!getSchemaResponse.success) {
      return;
    }

    const { data: schema } = getSchemaResponse;

    const output = resolve(outputPath);

    await generate({
      schema,
      output,
      scalarTypes: {
        DateTime: 'string',
        JSON: 'Record<string, unknown>',
        UUID: 'string',
      },
    });

    await this.injectTwentyClient(output);

    console.log(chalk.green('✓ Client generated successfully!'));
    console.log(chalk.gray(`Generated files at: ${outputPath}`));
  }

  private async injectTwentyClient(output: string) {
    const twentyClientContent = `

// ----------------------------------------------------
// ✨ Custom Twenty client (auto-injected)
// ----------------------------------------------------

const defaultOptions: ClientOptions = {
  url: \`\${process.env.${DEFAULT_API_URL_NAME}}/graphql\`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: \`Bearer \${process.env.${DEFAULT_API_KEY_NAME}}\`,
  },
}

export default class Twenty {
  private client: Client;
  private apiUrl: string;
  private authorizationToken: string;

  constructor(options?: ClientOptions) {
    const merged: ClientOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options?.headers ?? {}),
      },
    };

    this.client = createClient(merged);
    this.apiUrl = merged.url;
    this.authorizationToken = merged.headers.Authorization;
  }

  query<R extends QueryGenqlSelection>(request: R & { __name?: string }) {
    return this.client.query(request);
  }

  mutation<R extends MutationGenqlSelection>(request: R & { __name?: string }) {
    return this.client.mutation(request);
  }

  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    contentType: string = 'application/octet-stream',
    fileFolder: string = 'Attachment',
  ): Promise<{ path: string; token: string }> {
    const form = new FormData();

    form.append('operations', JSON.stringify({
      query: \`mutation UploadFile($file: Upload!, $fileFolder: FileFolder) {
        uploadFile(file: $file, fileFolder: $fileFolder) { path token }
      }\`,
      variables: { file: null, fileFolder },
    }));
    form.append('map', JSON.stringify({ '0': ['variables.file'] }));
    form.append('0', new Blob([fileBuffer], { type: contentType }), filename);


    const response = await fetch(\`\${this.apiUrl}/graphql\`, {
      method: 'POST',
      headers: {
        Authorization: this.authorizationToken,
      },
      body: form,
    });

    const result = await response.json();

    if (result.errors) {
      throw new GenqlError(result.errors, result.data);
    }

    return result.data.uploadFile;
  }
}

`;

    await fs.appendFile(join(output, 'index.ts'), twentyClientContent);
  }

  private isTokenExpiredOrExpiringSoon(expiresAt: string): boolean {
    const expirationTimestamp = Date.parse(expiresAt);

    if (Number.isNaN(expirationTimestamp)) {
      return true;
    }

    return (
      expirationTimestamp - Date.now() <=
      ClientService.TOKEN_RENEWAL_WINDOW_IN_MILLISECONDS
    );
  }

  private async getApplicationUniversalIdentifier(
    appPath: string,
  ): Promise<string | null> {
    const outputManifestPath = join(appPath, OUTPUT_DIR, 'manifest.json');

    if (await fs.pathExists(outputManifestPath)) {
      const outputManifest = await fs.readJSON(outputManifestPath);
      const outputApplicationUniversalIdentifier =
        outputManifest?.application?.universalIdentifier;

      if (typeof outputApplicationUniversalIdentifier === 'string') {
        return outputApplicationUniversalIdentifier;
      }
    }

    const manifestBuildResult = await buildManifest(appPath);

    return (
      manifestBuildResult.manifest?.application.universalIdentifier ?? null
    );
  }

  private async getValidApplicationTokenPair(
    applicationUniversalIdentifier: string,
  ): Promise<ApplicationTokenPair | null> {
    const storedApplicationTokenPair =
      await this.configService.getApplicationTokenPair(
        applicationUniversalIdentifier,
      );

    if (
      storedApplicationTokenPair &&
      !this.isTokenExpiredOrExpiringSoon(
        storedApplicationTokenPair.applicationAccessToken.expiresAt,
      )
    ) {
      return storedApplicationTokenPair;
    }

    if (
      storedApplicationTokenPair &&
      !this.isTokenExpiredOrExpiringSoon(
        storedApplicationTokenPair.applicationRefreshToken.expiresAt,
      )
    ) {
      const renewApplicationTokenResult =
        await this.apiService.renewApplicationToken(
          storedApplicationTokenPair.applicationRefreshToken.token,
        );

      if (renewApplicationTokenResult.success) {
        await this.configService.setApplicationTokenPair({
          applicationUniversalIdentifier,
          applicationTokenPair: renewApplicationTokenResult.data,
        });

        return renewApplicationTokenResult.data;
      }
    }

    const findApplicationResult =
      await this.apiService.findOneApplicationByUniversalIdentifier(
        applicationUniversalIdentifier,
      );

    if (!findApplicationResult.success) {
      return null;
    }

    const generateApplicationTokenPairResult =
      await this.apiService.generateApplicationTokenPair(
        findApplicationResult.data.id,
      );

    if (!generateApplicationTokenPairResult.success) {
      return null;
    }

    await this.configService.setApplicationTokenPair({
      applicationUniversalIdentifier,
      applicationTokenPair: generateApplicationTokenPairResult.data,
    });

    return generateApplicationTokenPairResult.data;
  }
}
