import * as fs from 'fs-extra';
import { BASE_APPLICATION_PROJECT_PATH } from '../constants/constants-path';
import { writeJsoncFile } from '../utils/jsonc-parser';
import { join } from 'path';
import { v4 } from 'uuid';

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
  await fs.copy(BASE_APPLICATION_PROJECT_PATH, appDirectory);

  await fs.rename(
    join(appDirectory, 'gitignore'),
    join(appDirectory, '.gitignore'),
  );

  await fs.copy(join(appDirectory, '.env.example'), join(appDirectory, '.env'));

  await createBasePackageJson({
    appName,
    appDirectory,
  });

  await createApplicationConfig({
    displayName: appDisplayName,
    description: appDescription,
    appDirectory,
  });

  await createReadmeContent({
    displayName: appDisplayName,
    appDescription,
    appDirectory,
  });
};

const createApplicationConfig = async ({
  displayName,
  description,
  appDirectory,
}: {
  displayName: string;
  description?: string;
  appDirectory: string;
}) => {
  const content = `import { type ApplicationConfig } from 'twenty-sdk/application';

const config: ApplicationConfig = {
  universalIdentifier: '${v4()}',
  displayName: '${displayName}',
  description: '${description ?? ''}',
};

export default config;
`;

  await fs.writeFile(join(appDirectory, 'application.config.ts'), content);
};

const createBasePackageJson = async ({
  appName,
  appDirectory,
}: {
  appName: string;
  appDirectory: string;
}) => {
  const packageJson = {
    name: appName,
    version: '0.0.1',
    license: 'MIT',
    engines: {
      node: '^24.5.0',
      npm: 'please-use-yarn',
      yarn: '>=4.0.2',
    },
    packageManager: 'yarn@4.9.2',
    scripts: {
      generate: 'twenty app generate',
      sync: 'twenty app sync',
      dev: 'twenty app dev',
      uninstall: 'twenty app uninstall',
      auth: 'twenty auth login',
    },
    dependencies: {
      'twenty-sdk': '0.1.0',
    },
    devDependencies: {
      '@types/node': '^24.7.2',
      typescript: '^5.9.3',
    },
  };
  await writeJsoncFile(join(appDirectory, 'package.json'), packageJson);
};

const createReadmeContent = async ({
  displayName,
  appDescription,
  appDirectory,
}: {
  displayName: string;
  appDescription: string;
  appDirectory: string;
}) => {
  const readmeContent = `# ${displayName}

${appDescription}
`;

  await fs.writeFile(join(appDirectory, 'README.md'), readmeContent);
};
