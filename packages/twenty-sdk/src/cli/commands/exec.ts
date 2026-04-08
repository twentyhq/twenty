import { functionExecute } from '@/cli/operations/execute';
import { APP_ERROR_CODES, FUNCTION_ERROR_CODES } from '@/cli/types';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import chalk from 'chalk';
import { isDefined } from 'twenty-shared/utils';

export class LogicFunctionExecuteCommand {
  async execute({
    appPath = CURRENT_EXECUTION_DIRECTORY,
    postInstall = false,
    functionUniversalIdentifier,
    functionName,
    payload = '{}',
  }: {
    appPath?: string;
    postInstall?: boolean;
    functionUniversalIdentifier?: string;
    functionName?: string;
    payload?: string;
  }): Promise<void> {
    let parsedPayload: Record<string, unknown>;
    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      console.error(
        chalk.red('Invalid JSON payload. Please provide valid JSON.'),
      );
      process.exit(1);
    }

    const identifier = postInstall
      ? 'post install'
      : (functionUniversalIdentifier ?? functionName);

    console.log(chalk.blue(`🚀 Executing function "${identifier}"...`));
    console.log(chalk.gray(`   Payload: ${JSON.stringify(parsedPayload)}\n`));

    const executeOptions = postInstall
      ? { appPath, postInstall: true as const, payload: parsedPayload }
      : functionUniversalIdentifier
        ? { appPath, functionUniversalIdentifier, payload: parsedPayload }
        : { appPath, functionName: functionName!, payload: parsedPayload };

    const result = await functionExecute(executeOptions);

    if (!result.success) {
      switch (result.error.code) {
        case APP_ERROR_CODES.MANIFEST_NOT_FOUND: {
          console.error(chalk.red('Failed to build manifest.'));
          break;
        }
        case FUNCTION_ERROR_CODES.FETCH_FUNCTIONS_FAILED: {
          console.error(
            chalk.red('Failed to fetch functions:'),
            result.error.message,
          );
          break;
        }
        case FUNCTION_ERROR_CODES.FUNCTION_NOT_FOUND: {
          console.error(chalk.red(result.error.message), '\n');

          const availableFunctions = (result.error.details
            ?.availableFunctions ?? []) as Array<{
            name: string;
            universalIdentifier: string;
          }>;

          if (availableFunctions.length > 0) {
            console.log(chalk.cyan('Available functions:'));
            availableFunctions.forEach((logicFunction) => {
              console.log(
                `  - ${chalk.white(logicFunction.name)} (${logicFunction.universalIdentifier})`,
              );
            });
          } else {
            console.log(
              chalk.yellow(
                'No functions found for this application. Have you synced your app with `twenty dev`?',
              ),
            );
          }
          break;
        }
        case FUNCTION_ERROR_CODES.EXECUTION_FAILED: {
          console.error(chalk.red('Execution failed:'), result.error.message);
          break;
        }
        default: {
          console.error(chalk.red(result.error.message));
        }
      }
      process.exit(1);
    }

    const executionResult = result.data;

    console.log(chalk.cyan('─'.repeat(60)));
    console.log(chalk.cyan('Execution Result'));
    console.log(chalk.cyan('─'.repeat(60)));

    const statusColor =
      executionResult.status === 'SUCCESS' ? chalk.green : chalk.red;
    console.log(
      `${chalk.bold('Status:')} ${statusColor(executionResult.status)}`,
    );

    console.log(`${chalk.bold('Duration:')} ${executionResult.duration}ms\n`);

    if (isDefined(executionResult.data)) {
      console.log(chalk.bold('Data:'));
      console.log(chalk.white(JSON.stringify(executionResult.data, null, 2)));
    }

    if (executionResult.error) {
      console.log(chalk.bold.red('Error:'));
      console.log(chalk.red(`  Type: ${executionResult.error.errorType}`));
      console.log(
        chalk.red(`  Message: ${executionResult.error.errorMessage}\n`),
      );
      if (executionResult.error.stackTrace) {
        console.log(chalk.gray('Stack trace:'));
        console.log(chalk.gray(executionResult.error.stackTrace));
      }
    }

    if (executionResult.logs) {
      console.log(chalk.bold('Logs:'));
      console.log(chalk.gray(executionResult.logs));
    }

    console.log(chalk.cyan('─'.repeat(60)));

    if (executionResult.status !== 'SUCCESS') {
      process.exit(1);
    }
  }
}
