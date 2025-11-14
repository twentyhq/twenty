import { CURRENT_EXECUTION_DIRECTORY } from '../constants/current-execution-directory';
import chalk from 'chalk';
import { ConfigService } from '../services/config.service';
import { generateClient } from '../utils/generate-client';
import { join } from 'path';

const GENERATED_FOLDER_NAME = 'generated';

export class AppGenerateCommand {
  private configService = new ConfigService();

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

      await this.generateSdkAfterSync(outputPath);
    } catch (error) {
      console.error(
        chalk.red('Generate Twenty client failed:'),
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }

  private async generateSdkAfterSync(outputPath: string): Promise<void> {
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

    await generateClient({
      url: `${url}/graphql`,
      token,
      graphqlEndpoint: 'core',
      outputPath,
    });

    console.log(chalk.green('✓ Client generated successfully!'));
    console.log(chalk.gray(`Generated files at: ${outputPath}`));
  }
}
