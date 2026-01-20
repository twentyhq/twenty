import chalk from 'chalk';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import { ApiService } from '@/cli/utilities/api/services/api.service';
import { buildManifest } from '@/cli/utilities/manifest/utils/manifest-build';
import { type ApplicationManifest } from 'twenty-shared/application';

export class FunctionExecuteCommand {
  private apiService = new ApiService();

  async execute({
    appPath = CURRENT_EXECUTION_DIRECTORY,
    functionUniversalIdentifier,
    functionName,
    payload = '{}',
  }: {
    appPath?: string;
    functionUniversalIdentifier?: string;
    functionName?: string;
    payload?: string;
  }): Promise<void> {
    try {
      // Parse JSON payload
      let parsedPayload: Record<string, unknown>;
      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        console.error(
          chalk.red('Invalid JSON payload. Please provide valid JSON.'),
        );
        process.exit(1);
      }

      // Build manifest to get application info
      const { manifest } = await buildManifest(appPath);

      // Find the function
      const functionsResult = await this.apiService.findServerlessFunctions();
      if (!functionsResult.success) {
        console.error(
          chalk.red('Failed to fetch functions:'),
          functionsResult.error instanceof Error
            ? functionsResult.error.message
            : functionsResult.error,
        );
        process.exit(1);
      }

      // Filter functions belonging to this application
      const appFunctions = functionsResult.data.filter(
        (fn) =>
          fn.universalIdentifier && this.belongsToApplication(fn, manifest),
      );

      // Find the specific function
      const targetFunction = appFunctions.find((fn) => {
        if (functionUniversalIdentifier) {
          return fn.universalIdentifier === functionUniversalIdentifier;
        }
        if (functionName) {
          return fn.name === functionName;
        }
        return false;
      });

      if (!targetFunction) {
        const identifier = functionUniversalIdentifier || functionName;
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
              'No functions found for this application. Have you synced your app with `yarn app:sync`?',
            ),
          );
        }
        process.exit(1);
      }

      // Execute the function
      console.log(
        chalk.blue(`🚀 Executing function "${targetFunction.name}"...`),
      );
      console.log(chalk.gray(`   Payload: ${JSON.stringify(parsedPayload)}`));
      console.log('');

      const result = await this.apiService.executeServerlessFunction({
        functionId: targetFunction.id,
        payload: parsedPayload,
        version: 'draft',
      });

      if (!result.success) {
        console.error(
          chalk.red('Execution failed:'),
          result.error instanceof Error ? result.error.message : result.error,
        );
        process.exit(1);
      }

      const executionResult = result.data!;

      // Display results
      console.log(chalk.cyan('─'.repeat(60)));
      console.log(chalk.cyan('Execution Result'));
      console.log(chalk.cyan('─'.repeat(60)));

      // Status
      const statusColor =
        executionResult.status === 'SUCCESS' ? chalk.green : chalk.red;
      console.log(
        `${chalk.bold('Status:')} ${statusColor(executionResult.status)}`,
      );

      // Duration
      console.log(`${chalk.bold('Duration:')} ${executionResult.duration}ms`);

      // Data
      if (executionResult.data !== undefined && executionResult.data !== null) {
        console.log('');
        console.log(chalk.bold('Data:'));
        console.log(chalk.white(JSON.stringify(executionResult.data, null, 2)));
      }

      // Error
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

      // Logs
      if (executionResult.logs) {
        console.log('');
        console.log(chalk.bold('Logs:'));
        console.log(chalk.gray(executionResult.logs));
      }

      console.log(chalk.cyan('─'.repeat(60)));

      // Exit with error code if execution failed
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
    manifest: ApplicationManifest,
  ): boolean {
    // Check if function's universalIdentifier matches any function in the manifest
    return manifest.serverlessFunctions.some(
      (manifestFn) => manifestFn.universalIdentifier === fn.universalIdentifier,
    );
  }
}
