import { randomUUID } from 'crypto';
import { getSchemaUrls } from './schema-validator';
import * as fs from 'fs-extra';
import { BASE_APPLICATION_PROJECT_PATH } from '../constants/base-application-project-path';
import { writeJsoncFile } from '../utils/jsonc-parser';
import { join } from 'path';
import path from 'path';

export const copyBaseApplicationProject = async ({
  appName,
  appDescription,
  appDirectory,
}: {
  appName: string;
  appDescription: string;
  appDirectory: string;
}) => {
  await fs.copy(BASE_APPLICATION_PROJECT_PATH, appDirectory);

  await createBasePackageJson({
    appName,
    appDescription,
    appDirectory,
  });

  await createReadmeContent({
    appName,
    appDescription,
    appDirectory,
  });
};

const createBasePackageJson = async ({
  appName,
  appDescription,
  appDirectory,
}: {
  appName: string;
  appDescription: string;
  appDirectory: string;
}) => {
  const base = JSON.parse(await readBaseApplicationProjectFile('package.json'));

  const schemas = getSchemaUrls();

  base['$schema'] = schemas.appManifest;
  base['universalIdentifier'] = randomUUID();
  base['name'] = appName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  base['description'] = appDescription;

  await writeJsoncFile(join(appDirectory, 'package.json'), base);
};

const createReadmeContent = async ({
  appName,
  appDescription,
  appDirectory,
}: {
  appName: string;
  appDescription: string;
  appDirectory: string;
}) => {
  let readmeContent = await readBaseApplicationProjectFile('README.md');

  readmeContent = readmeContent.replace(/\{title}/g, appName);

  readmeContent = readmeContent.replace(/\{description}/g, appDescription);

  await fs.writeFile(path.join(appDirectory, 'README.md'), readmeContent);
};

const readBaseApplicationProjectFile = async (fileName: string) => {
  return await fs.readFile(
    join(BASE_APPLICATION_PROJECT_PATH, fileName),
    'utf-8',
  );
};
