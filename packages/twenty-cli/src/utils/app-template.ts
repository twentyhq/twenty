import { randomUUID } from 'crypto';
import { AgentManifest, PackageJson } from '../types/config.types';
import { getSchemaUrls } from './schema-validator';

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
      yarn: '>=4.0.2',
    },
    packageManager: 'yarn@4.9.2',
    description,
    license: 'MIT',
    version: '0.0.1',
  };
};

export const createAgentManifest = (appName: string): AgentManifest => {
  const schemas = getSchemaUrls();

  return {
    $schema: schemas.agent,
    standardId: randomUUID(),
    name: `${appName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}Agent`,
    label: `${appName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')} Agent`,
    description: `AI agent for ${appName}`,
    prompt: `You are an AI agent for ${appName}. Help users with their tasks and provide assistance with Twenty CRM features.`,
    modelId: 'auto',
    responseFormat: {
      type: 'text',
    },
  };
};

export const createGitignoreContent = () => {
  return `node_modules
.yarn/install-state.gz
`;
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
