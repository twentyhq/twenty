import chalk from 'chalk';
import { Command } from 'commander';
import { generateSdk } from 'twenty-sdk/api';
import { ConfigService } from '../services/config.service';

export class SdkCommand {
  private configService = new ConfigService();

  getCommand(): Command {
    const sdkCommand = new Command('sdk');
    sdkCommand.description('SDK generation commands');

    sdkCommand
      .command('generate')
      .description('Generate TypeScript SDK from Twenty GraphQL API')
      .option(
        '-o, --output <path>',
        'Output directory for generated SDK (overrides config)',
      )
      .action(async (options) => {
        await this.generate(options);
      });

    return sdkCommand;
  }

  private async generate(options: { output?: string }): Promise<void> {
    try {
      const config = await this.configService.getConfig();

      const url = config.apiUrl;
      const token = config.apiKey;

      if (!url) {
        console.error(chalk.red('✗ API URL not configured.'));
        console.log(
          chalk.yellow('Run `twenty auth login` or set it manually:'),
        );
        console.log(
          chalk.gray('  twenty config set apiUrl http://localhost:3000'),
        );
        process.exit(1);
      }

      if (!token) {
        console.error(chalk.red('✗ API token not configured.'));
        console.log(
          chalk.yellow('Run `twenty auth login` or set it manually:'),
        );
        console.log(chalk.gray('  twenty config set apiKey YOUR_API_KEY'));
        process.exit(1);
      }

      const outputPath =
        options.output || config.sdkOutputPath || 'src/generated/';

      console.log(chalk.blue('📦 Generating Twenty SDK...'));
      console.log(chalk.gray(`API URL: ${url}`));
      console.log(chalk.gray(`Output: ${outputPath}`));

      await generateSdk({
        url: `${url}/graphql`,
        token,
        graphqlEndpoint: 'core',
      });

      console.log(chalk.green('✓ SDK generated successfully!'));
      console.log(chalk.gray(`\nGenerated files at: ${outputPath}`));
      console.log(
        chalk.gray('\nTip: You can configure the default output path:'),
      );
      console.log(
        chalk.gray(`  twenty config set sdkOutputPath ${outputPath}`),
      );
    } catch (error) {
      console.error(
        chalk.red('✗ SDK generation failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }
}
