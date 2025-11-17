import { CURRENT_EXECUTION_DIRECTORY } from '../constants/current-execution-directory';
import chalk from 'chalk';
import { ConfigService } from '../services/config.service';
import { join, resolve } from 'path';
import { ApiService } from '../services/api.service';
import { generate } from '@genql/cli';

const GENERATED_FOLDER_NAME = 'generated';

export class AppGenerateCommand {
  private configService = new ConfigService();
  private apiService = new ApiService();

  async execute(
    outputPath: string = join(
      CURRENT_EXECUTION_DIRECTORY,
      GENERATED_FOLDER_NAME,
    ),
  ) {
    try {
      console.log(chalk.blue('📦 Generating Twenty client...'));
      console.log(chalk.gray(`📁 Output Path: ${outputPath}`));
      console.log('');

      await this.generateClient(outputPath);
    } catch (error) {
      console.error(
        chalk.red('Generate Twenty client failed:'),
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }

  private async generateClient(outputPath: string): Promise<void> {
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

    const { data: schema } = await this.apiService.getSchema();

    await generate({
      schema,
      output: resolve(outputPath),
      scalarTypes: {
        DateTime: 'string',
        JSON: 'Record<string, unknown>',
        UUID: 'string',
      },
      verbose: true,
    });

    console.log(chalk.green('✓ Client generated successfully!'));
    console.log(chalk.gray(`Generated files at: ${outputPath}`));
  }
}
