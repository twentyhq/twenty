import { appBuild } from '@/cli/public-operations/app-build';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { ConfigService } from '@/cli/utilities/config/config-service';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export type AppPushCommandOptions = {
  appPath?: string;
  server?: string;
  token?: string;
};

export class AppPushCommand {
  async execute(options: AppPushCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    const configService = new ConfigService();
    const config = await configService.getConfig();
    const serverUrl = options.server ?? config.apiUrl;
    const token = options.token ?? config.apiKey;

    if (!token) {
      console.error(
        chalk.red(
          'No auth token found. Please provide --token or run auth:login first.',
        ),
      );
      process.exit(1);
    }

    console.log(chalk.blue('Building, packing, and pushing application...'));
    console.log(chalk.gray(`App path: ${appPath}`));
    console.log(chalk.gray(`Server: ${serverUrl}`));
    console.log('');

    const buildResult = await appBuild({
      appPath,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!buildResult.success) {
      console.error(chalk.red(buildResult.error.message));
      process.exit(1);
    }

    console.log(chalk.gray('Packing tarball...'));

    const outputDir = path.join(appPath, '.twenty', 'output');

    const packOutput = execSync('npm pack --pack-destination .', {
      cwd: outputDir,
      encoding: 'utf-8',
    }).trim();

    const tarballName = packOutput.split('\n').pop()!;
    const tarballPath = path.join(outputDir, tarballName);

    if (!fs.existsSync(tarballPath)) {
      console.error(chalk.red(`Tarball not found at ${tarballPath}`));
      process.exit(1);
    }

    console.log(chalk.gray(`Uploading ${path.basename(tarballPath)}...`));

    const fileBuffer = fs.readFileSync(tarballPath);
    const base64 = fileBuffer.toString('base64');

    const response = await fetch(
      `${serverUrl}/api/app-registrations/upload-tarball`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tarball: base64 }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        chalk.red(`Upload failed (${response.status}): ${errorText}`),
      );
      process.exit(1);
    }

    console.log(chalk.green('✓ Application pushed successfully'));
  }
}
