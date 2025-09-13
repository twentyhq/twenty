import { randomUUID } from 'crypto';
import { AgentManifest, AppManifest } from '../types/config.types';
import { SchemaValidator } from './schema-validator';

export type AppManifestTemplate = Omit<AppManifest, 'agents'> & {
  $schema?: string;
  // agents will be discovered from the agents/ folder
};

export type AgentManifestTemplate = AgentManifest & {
  $schema?: string;
};

export const createManifest = (appName: string): AppManifestTemplate => {
  const schemas = SchemaValidator.getSchemaUrls();

  return {
    $schema: schemas.appManifest,
    standardId: randomUUID(),
    label: appName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    description: `A Twenty application for ${appName}`,
    version: '1.0.0',
    // agents will be discovered from the agents/ folder
  };
};

export const createAgentManifest = (appName: string): AgentManifestTemplate => {
  const schemas = SchemaValidator.getSchemaUrls();

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
