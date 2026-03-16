import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import chalk from 'chalk';

export class WhoamiCommand {
  private configService = new ConfigService();
  private apiService = new ApiService();

  async execute(): Promise<void> {
    try {
      const activeRemote = ConfigService.getActiveRemote();
      const config = await this.configService.getConfig();

      const authMethod = config.accessToken
        ? 'oauth'
        : config.apiKey
          ? 'api-key'
          : 'none';

      console.log(`  Remote:  ${chalk.bold(activeRemote)}`);
      console.log(`  Server:  ${config.apiUrl}`);

      if (authMethod === 'none') {
        console.log(`  Auth:    ${chalk.yellow('not configured')}`);
        return;
      }

      const { authValid } = await this.apiService.validateAuth();

      const statusText = authValid
        ? chalk.green(`${authMethod} (valid)`)
        : chalk.red(`${authMethod} (invalid)`);

      console.log(`  Auth:    ${statusText}`);
    } catch (error) {
      console.error(
        chalk.red('Failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }
}
