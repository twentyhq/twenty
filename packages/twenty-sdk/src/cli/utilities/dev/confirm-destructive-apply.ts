import chalk from 'chalk';
import inquirer from 'inquirer';

export const confirmDestructiveApply = async (
  deleteCount: number,
  { force }: { force?: boolean },
): Promise<boolean> => {
  if (force) {
    return true;
  }

  if (!process.stdout.isTTY) {
    console.error(
      chalk.red(
        `${deleteCount} destructive change(s) detected. Re-run with --force to apply them non-interactively.`,
      ),
    );

    return false;
  }

  const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
    {
      type: 'confirm',
      name: 'confirmed',
      message: `Twenty will DESTROY ${deleteCount} metadata entity(ies). Do you want to perform these actions?`,
      default: false,
    },
  ]);

  return confirmed;
};
