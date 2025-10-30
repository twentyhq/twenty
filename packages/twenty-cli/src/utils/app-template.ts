import { randomUUID } from 'crypto';
import { getSchemaUrls } from './schema-validator';
import * as fs from 'fs-extra';
import { BASE_APPLICATION_PROJECT_PATH } from '../constants/constants-path';
import { writeJsoncFile } from '../utils/jsonc-parser';
import { join } from 'path';
import path from 'path';
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

  await fs.writeFile(path.join(appDirectory, 'application.config.ts'), content);
};

const createBasePackageJson = async ({
  appName,
  appDirectory,
}: {
  appName: string;
  appDirectory: string;
}) => {
  const base = JSON.parse(await readBaseApplicationProjectFile('package.json'));

  const schemas = getSchemaUrls();

  base['$schema'] = schemas.appManifest;
  base['universalIdentifier'] = randomUUID();
  base['name'] = appName;

  await writeJsoncFile(join(appDirectory, 'package.json'), base);
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
  let readmeContent = await readBaseApplicationProjectFile('README.md');

  readmeContent = readmeContent.replace(/\{title}/g, displayName);

  readmeContent = readmeContent.replace(/\{description}/g, appDescription);

  await fs.writeFile(path.join(appDirectory, 'README.md'), readmeContent);
};

const readBaseApplicationProjectFile = async (fileName: string) => {
  return await fs.readFile(
    join(BASE_APPLICATION_PROJECT_PATH, fileName),
    'utf-8',
  );
};
