import { appRegister } from '@/cli/public-operations/app-register';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import chalk from 'chalk';

export class AppRegisterCommand {
  async execute({
    packageName,
    appPath = CURRENT_EXECUTION_DIRECTORY,
  }: {
    packageName?: string;
    appPath?: string;
  }): Promise<void> {
    console.log(chalk.blue('Registering npm package ownership...'));

    if (packageName) {
      console.log(chalk.gray(`Package: ${packageName}`));
    } else {
      console.log(
        chalk.gray(`Reading package name from ${appPath}/package.json`),
      );
    }

    console.log('');

    const result = await appRegister({ packageName, appPath });

    if (!result.success) {
      console.error(chalk.red('Registration failed:'), result.error.message);
      process.exit(1);
    }

    console.log(chalk.green('Package registered successfully!'));
    console.log(chalk.gray(`  Name: ${result.data.name}`));
    console.log(chalk.gray(`  ID: ${result.data.universalIdentifier}`));

    if (result.data.isProvenanceVerified) {
      console.log(chalk.green('  Provenance: Verified'));

      if (result.data.provenanceRepositoryUrl) {
        console.log(
          chalk.gray(`  Repository: ${result.data.provenanceRepositoryUrl}`),
        );
      }
    } else {
      console.log(
        chalk.yellow(
          '  Provenance: Not found. Publish with --provenance for a verified badge.',
        ),
      );
    }
  }
}
