import { generate } from '@genql/cli';
import chalk from 'chalk';
import { join, resolve } from 'path';
import { ApiService } from '@/cli/services/api.service';
import { ConfigService } from '@/cli/services/config.service';
import * as fs from 'fs-extra';
import {
  DEFAULT_API_URL_NAME,
  DEFAULT_API_KEY_NAME,
} from 'twenty-shared/application';

export const GENERATED_FOLDER_NAME = 'generated';

export class GenerateService {
  private configService: ConfigService;
  private apiService: ApiService;

  constructor() {
    this.configService = new ConfigService();
    this.apiService = new ApiService();
  }

  async generateClient(appPath: string): Promise<void> {
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

    const getSchemaResponse = await this.apiService.getSchema();

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
  }

  query<R extends QueryGenqlSelection>(request: R & { __name?: string }) {
    return this.client.query(request);
  }

  mutation<R extends MutationGenqlSelection>(request: R & { __name?: string }) {
    return this.client.mutation(request);
  }
}

`;

    await fs.appendFile(join(output, 'index.ts'), twentyClientContent);
  }
}
