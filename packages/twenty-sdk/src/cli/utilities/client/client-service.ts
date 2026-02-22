import { ApiService } from '@/cli/utilities/api/api-service';
import { generate } from '@genql/cli';
import * as fs from 'fs-extra';
import { join } from 'path';
import {
  DEFAULT_API_KEY_NAME,
  DEFAULT_API_URL_NAME,
  GENERATED_DIR,
} from 'twenty-shared/application';

export class ClientService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService({ disableInterceptors: true });
  }

  async generate({
    appPath,
    authToken,
  }: {
    appPath: string;
    authToken?: string;
  }): Promise<void> {
    const outputPath = this.resolveGeneratedPath(appPath);
    const tempPath = `${outputPath}.tmp`;

    const getSchemaResponse = await this.apiService.getSchema({ authToken });

    if (!getSchemaResponse.success) {
      throw new Error(
        `Failed to introspect schema: ${JSON.stringify(getSchemaResponse.error)}`,
      );
    }

    const { data: schema } = getSchemaResponse;

    await fs.ensureDir(tempPath);
    await fs.emptyDir(tempPath);

    await generate({
      schema,
      output: tempPath,
      scalarTypes: {
        DateTime: 'string',
        JSON: 'Record<string, unknown>',
        UUID: 'string',
      },
    });

    await this.injectTwentyClient(tempPath);

    await fs.remove(outputPath);
    await fs.move(tempPath, outputPath);
  }

  private resolveGeneratedPath(appPath: string): string {
    return join(appPath, 'node_modules', 'twenty-sdk', GENERATED_DIR);
  }

  private async injectTwentyClient(output: string) {
    const twentyClientContent = `

// ----------------------------------------------------
// Custom Twenty client (auto-injected)
// ----------------------------------------------------

const defaultOptions: ClientOptions = {
  url: \`\${process.env.${DEFAULT_API_URL_NAME}}/graphql\`,
  metadataUrl: \`\${process.env.${DEFAULT_API_URL_NAME}}/metadata\`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: \`Bearer \${process.env.${DEFAULT_API_KEY_NAME}}\`,
  },
}

export default class Twenty {
  private client: Client;
  private url: string;
  private metadataUrl: string;
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
    this.url = merged.url;
    this.metadataUrl = merged.metadataUrl;
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
    fieldMetadataUniversalIdentifier: string,
  ): Promise<{
    id: string;
    path: string;
    size: number;
    createdAt: string;
    url: string;
  }> {
    const form = new FormData();

    form.append(
      'operations',
      JSON.stringify({
        query: \`mutation UploadFilesFieldFileByUniversalIdentifier($file: Upload!, $fieldMetadataUniversalIdentifier: String!) {
        uploadFilesFieldFileByUniversalIdentifier(file: $file, fieldMetadataUniversalIdentifier: $fieldMetadataUniversalIdentifier) { id path size createdAt url }
      }\`,
        variables: { file: null, fieldMetadataUniversalIdentifier },
      }),
    );
    form.append('map', JSON.stringify({ '0': ['variables.file'] }));
    form.append('0', new Blob([fileBuffer], { type: contentType }), filename);

    const response = await fetch(this.metadataUrl, {
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

    return result.data.uploadFilesFieldFileByUniversalIdentifier;
  }
}

`;

    await fs.appendFile(join(output, 'index.ts'), twentyClientContent);
  }
}
