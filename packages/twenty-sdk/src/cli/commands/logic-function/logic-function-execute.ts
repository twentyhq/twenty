import { ApiService } from '@/cli/utilities/api/api-service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import chalk from 'chalk';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { readManifestFromFile } from '@/cli/utilities/build/manifest/manifest-reader';

export class LogicFunctionExecuteCommand {
  private apiService = new ApiService();

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
    try {
      let parsedPayload: Record<string, unknown>;
      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        console.error(
          chalk.red('Invalid JSON payload. Please provide valid JSON.'),
        );
        process.exit(1);
      }

      const manifest = await readManifestFromFile(appPath);

      if (!manifest) {
        console.error(chalk.red('Failed to build manifest.'));
        process.exit(1);
      }

      const functionsResult = await this.apiService.findLogicFunctions();
      if (!functionsResult.success) {
        console.error(
          chalk.red('Failed to fetch functions:'),
          functionsResult.error instanceof Error
            ? functionsResult.error.message
            : functionsResult.error,
        );
        process.exit(1);
      }

      const appFunctions = functionsResult.data.filter(
        (fn) =>
          fn.universalIdentifier && this.belongsToApplication(fn, manifest),
      );

      const targetFunction = appFunctions.find((fn) => {
        if (postInstall) {
          return (
            fn.universalIdentifier ===
            manifest.application.postInstallLogicFunctionUniversalIdentifier
          );
        }
        if (functionUniversalIdentifier) {
          return fn.universalIdentifier === functionUniversalIdentifier;
        }
        if (functionName) {
          return fn.name === functionName;
        }
        return false;
      });

      if (!targetFunction) {
        const identifier = postInstall
          ? 'post install'
          : functionUniversalIdentifier || functionName;
        console.error(
          chalk.red(`Function "${identifier}" not found in application.`),
        );
        console.log('');
        if (appFunctions.length > 0) {
          console.log(chalk.cyan('Available functions:'));
          appFunctions.forEach((fn) => {
            console.log(
              `  - ${chalk.white(fn.name)} (${fn.universalIdentifier})`,
            );
          });
        } else {
          console.log(
            chalk.yellow(
              'No functions found for this application. Have you synced your app with `yarn app:dev`?',
            ),
          );
        }
        process.exit(1);
      }

      console.log(
        chalk.blue(`🚀 Executing function "${targetFunction.name}"...`),
      );
      console.log(chalk.gray(`   Payload: ${JSON.stringify(parsedPayload)}`));
      console.log('');

      const result = await this.apiService.executeLogicFunction({
        functionId: targetFunction.id,
        payload: parsedPayload,
      });

      if (!result.success) {
        console.error(
          chalk.red('Execution failed:'),
          result.error instanceof Error ? result.error.message : result.error,
        );
        process.exit(1);
      }

      const executionResult = result.data!;

      console.log(chalk.cyan('─'.repeat(60)));
      console.log(chalk.cyan('Execution Result'));
      console.log(chalk.cyan('─'.repeat(60)));

      const statusColor =
        executionResult.status === 'SUCCESS' ? chalk.green : chalk.red;
      console.log(
        `${chalk.bold('Status:')} ${statusColor(executionResult.status)}`,
      );

      console.log(`${chalk.bold('Duration:')} ${executionResult.duration}ms`);

      if (isDefined(executionResult.data)) {
        console.log('');
        console.log(chalk.bold('Data:'));
        console.log(chalk.white(JSON.stringify(executionResult.data, null, 2)));
      }

      if (executionResult.error) {
        console.log('');
        console.log(chalk.bold.red('Error:'));
        console.log(chalk.red(`  Type: ${executionResult.error.errorType}`));
        console.log(
          chalk.red(`  Message: ${executionResult.error.errorMessage}`),
        );
        if (executionResult.error.stackTrace) {
          console.log('');
          console.log(chalk.gray('Stack trace:'));
          console.log(chalk.gray(executionResult.error.stackTrace));
        }
      }

      if (executionResult.logs) {
        console.log('');
        console.log(chalk.bold('Logs:'));
        console.log(chalk.gray(executionResult.logs));
      }

      console.log(chalk.cyan('─'.repeat(60)));

      if (executionResult.status !== 'SUCCESS') {
        process.exit(1);
      }
    } catch (error) {
      console.error(
        chalk.red('Execution failed:'),
        error instanceof Error ? error.message : error,
      );
      process.exit(1);
    }
  }

  private belongsToApplication(
    fn: { universalIdentifier: string; applicationId: string | null },
    manifest: Manifest,
  ): boolean {
    return manifest.logicFunctions.some(
      (manifestFn) => manifestFn.universalIdentifier === fn.universalIdentifier,
    );
  }
}
