import { randomUUID } from 'crypto';
import { PackageJson } from '../types/config.types';
import { getSchemaUrls } from './schema-validator';
import { join } from 'path';
import * as fs from 'fs-extra';

export const createBasePackageJson = (
  appName: string,
  description: string,
): PackageJson => {
  const schemas = getSchemaUrls();

  return {
    $schema: schemas.appManifest,
    universalIdentifier: randomUUID(),
    label: appName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    engines: {
      node: '^24.5.0',
      npm: 'please-use-yarn',
      yarn: '>=4.9.2',
    },
    packageManager: 'yarn@4.9.2',
    description,
    license: 'MIT',
    version: '0.0.1',
  };
};

export const copyBaseApplicationProject = async (destinationDir: string) => {
  const baseApplicationProjectPath = join(
    __dirname,
    '../constants/base-application-project',
  );
  await fs.copy(baseApplicationProjectPath, destinationDir);
};

export const createReadmeContent = (
  appName: string,
  appDir: string,
): string => {
  return `# ${appName}

A Twenty application.

## Development

To start development mode:

\`\`\`bash
twenty app dev --path ${appDir}
\`\`\`

Or from the app directory:

\`\`\`bash
cd ${appDir}
twenty app dev
\`\`\`

## Deployment

To deploy the application:

\`\`\`bash
twenty app deploy --path ${appDir}
\`\`\`
`;
};
