import * as fs from 'fs-extra';
import { join } from 'path';
import { v4 } from 'uuid';

import createTwentyAppPackageJson from 'package.json';
import chalk from 'chalk';

const SRC_FOLDER = 'src';

export const copyBaseApplicationProject = async ({
  appName,
  appDisplayName,
  appDescription,
  appDirectory,
}: {
  appName: string;
  appDisplayName: string;
  appDescription: string;
  appDirectory: string;
}) => {
  console.log(chalk.gray('Generating application project...'));
  await fs.copy(join(__dirname, './constants/template'), appDirectory);

  await renameGitignore({ appDirectory });

  await generateUniversalIdentifiers({
    appDisplayName,
    appDescription,
    appDirectory,
  });

  await updatePackageJson({ appName, appDirectory });
};

const renameGitignore = async ({ appDirectory }: { appDirectory: string }) => {
  const gitignorePath = join(appDirectory, 'gitignore');

  if (await fs.pathExists(gitignorePath)) {
    await fs.rename(gitignorePath, join(appDirectory, '.gitignore'));
  }
};

const generateUniversalIdentifiers = async ({
  appDisplayName,
  appDescription,
  appDirectory,
}: {
  appDisplayName: string;
  appDescription: string;
  appDirectory: string;
}) => {
  const universalIdentifiersPath = join(
    appDirectory,
    SRC_FOLDER,
    'constants',
    'universal-identifiers.ts',
  );

  const universalIdentifiersFileContent = await fs.readFile(
    universalIdentifiersPath,
    'utf-8',
  );

  await fs.writeFile(
    universalIdentifiersPath,
    universalIdentifiersFileContent
      .replace('DISPLAY-NAME-TO-BE-GENERATED', appDisplayName)
      .replace('DESCRIPTION-TO-BE-GENERATED', appDescription)
      .replace(/UUID-TO-BE-GENERATED/g, () => v4()),
  );
};

const updatePackageJson = async ({
  appName,
  appDirectory,
}: {
  appName: string;
  appDirectory: string;
}) => {
  const packageJson = await fs.readJson(join(appDirectory, 'package.json'));

  packageJson.name = appName;
  packageJson.dependencies['twenty-sdk'] = createTwentyAppPackageJson.version;
  packageJson.dependencies['twenty-client-sdk'] =
    createTwentyAppPackageJson.version;

  await fs.writeFile(
    join(appDirectory, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf8',
  );
};
