import { randomUUID } from 'crypto';
import { AppManifest } from '../types/config.types';

export const createManifest = (appName: string): AppManifest => {
  return {
    standardId: randomUUID(),
    label: appName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    description: `A Twenty application for ${appName}`,
    version: '1.0.0',
    agents: [
      {
        standardId: randomUUID(),
        name: `${appName}Agent`,
        label: `${appName
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')} Agent`,
        description: `AI agent for ${appName}`,
        prompt: `You are an AI agent for ${appName}. Help users with their tasks.`,
        modelId: 'auto',
        responseFormat: {
          type: 'text',
        },
      },
    ],
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
