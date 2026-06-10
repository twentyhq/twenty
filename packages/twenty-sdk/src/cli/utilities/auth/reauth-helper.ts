import inquirer from 'inquirer';
import chalk from 'chalk';
import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';

export type ReauthOutcome = 'reauthenticated' | 'declined' | 'non-interactive';

const isInteractive = (): boolean => process.stdin.isTTY === true;

export const promptForReauthentication = async (
  remoteName: string,
): Promise<ReauthOutcome> => {
  if (!isInteractive()) {
    return 'non-interactive';
  }

  const { proceed } = await inquirer.prompt<{ proceed: boolean }>([
    {
      type: 'confirm',
      name: 'proceed',
      message: `Re-authenticate remote "${remoteName}" now?`,
      default: true,
    },
  ]);

  if (!proceed) {
    return 'declined';
  }

  const apiService = new ApiService();
  const { authValid } = await apiService.validateAuth();

  if (authValid) {
    console.log(chalk.green(`✓ Authenticated to "${remoteName}".`));

    return 'reauthenticated';
  }

  const configService = new ConfigService();
  const config = await configService.getConfigForRemote(remoteName);

  console.log(
    chalk.yellow(`Run \`twenty remote:add\` to re-authenticate.`),
  );
  console.log(
    chalk.gray(`Generate a new key at: ${config.apiUrl}/settings/developers`),
  );

  return 'declined';
};