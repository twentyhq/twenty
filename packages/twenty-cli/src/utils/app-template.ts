import { randomUUID } from 'crypto';
import { getSchemaUrls } from './schema-validator';
import * as fs from 'fs-extra';
import { BASE_APPLICATION_PROJECT_PATH } from '../constants/base-application-project-path';
import { writeJsoncFile } from '../utils/jsonc-parser';
import { join } from 'path';
import path from 'path';

export const copyBaseApplicationProject = async ({
  appName,
  description,
  appDir,
}: {
  appName: string;
  description: string;
  appDir: string;
}) => {
  await fs.copy(BASE_APPLICATION_PROJECT_PATH, appDir);

  await createBasePackageJson({ appName, description, appDir });

  await createReadmeContent({ appName, description, appDir });
};

const createBasePackageJson = async ({
  appName,
  description,
  appDir,
}: {
  appName: string;
  description: string;
  appDir: string;
}) => {
  const base = JSON.parse(
    await fs.readFile(
      join(BASE_APPLICATION_PROJECT_PATH, 'package.json'),
      'utf-8',
    ),
  );

  const schemas = getSchemaUrls();

  base['$schema'] = schemas.appManifest;
  base['universalIdentifier'] = randomUUID();
  base['name'] = appName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  base['description'] = description;

  await writeJsoncFile(join(appDir, 'package.json'), base);
};

const createReadmeContent = async ({
  appName,
  description,
  appDir,
}: {
  appName: string;
  description: string;
  appDir: string;
}) => {
  let readmeContent = await fs.readFile(
    join(BASE_APPLICATION_PROJECT_PATH, 'README.md'),
    'utf-8',
  );
  console.log('readmeContent', readmeContent);

  readmeContent = readmeContent.replace(/\{title}/g, appName);

  readmeContent = readmeContent.replace(/\{description}/g, description);

  readmeContent = readmeContent.replace(/\{appDir}/g, appDir);

  console.log('readmeContent after', readmeContent);

  await fs.writeFile(path.join(appDir, 'README.md'), readmeContent);
};
