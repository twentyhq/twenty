import { generate } from '@genql/cli';
import chalk from 'chalk';
import { join, resolve } from 'path';
import { ApiService } from '@/cli/services/api.service';
import { ConfigService } from '@/cli/services/config.service';

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

    console.log(chalk.green('✓ Client generated successfully!'));
    console.log(chalk.gray(`Generated files at: ${outputPath}`));
  }
}
