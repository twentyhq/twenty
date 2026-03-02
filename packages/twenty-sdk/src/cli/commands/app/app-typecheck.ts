import { appTypecheck } from '@/cli/private-operations/app-typecheck';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import chalk from 'chalk';
import { type TypecheckError } from '@/cli/utilities/build/common/typecheck-plugin';

export type AppTypecheckOptions = {
  appPath?: string;
};

const formatTypecheckError = (error: TypecheckError): string => {
  return `${chalk.cyan(error.file)}:${chalk.yellow(String(error.line))}:${chalk.yellow(String(error.column + 1))} - ${chalk.red('error')} ${error.text}`;
};

export class AppTypecheckCommand {
  async execute(options: AppTypecheckOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    console.log(chalk.blue('Running type check...'));
    console.log(chalk.gray(`App path: ${appPath}`));
    console.log('');

    const result = await appTypecheck({ appPath });

    if (!result.success) {
      console.error(chalk.red('Typecheck failed:'), result.error.message);
      process.exit(1);
    }

    const { errors } = result.data;

    if (errors.length === 0) {
      console.log(chalk.green('✓ No type errors found'));
      process.exit(0);
    }

    for (const error of errors) {
      console.log(formatTypecheckError(error));
    }

    console.log('');
    console.log(
      chalk.red(
        `✗ Found ${errors.length} type error${errors.length === 1 ? '' : 's'}`,
      ),
    );
    process.exit(1);
  }
}
