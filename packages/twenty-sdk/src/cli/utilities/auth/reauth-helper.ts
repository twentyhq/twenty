import inquirer from 'inquirer';
import chalk from 'chalk';
import { ApiService } from '@/cli/utilities/api/api-service';

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

  // Disable interceptors to prevent recursion: validateAuth() hitting 401
  // would otherwise trigger the same interceptor that called this function.
  const apiService = new ApiService({ disableInterceptors: true });
  const { authValid } = await apiService.validateAuth();

  if (authValid) {
    console.log(chalk.green(`✓ Authenticated to "${remoteName}".`));

    return 'reauthenticated';
  }

  console.log(
    chalk.yellow(`Run \`yarn twenty remote:add\` to re-authenticate.`),
  );

  return 'declined';
};
