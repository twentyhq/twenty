import kebabCase from 'lodash.kebabcase';
import { v4 } from 'uuid';

export type FunctionConfigTemplateOptions = {
  universalIdentifier?: string;
  name: string;
  description?: string;
  triggerType?: 'route' | 'cron' | 'databaseEvent';
};

export const getFunctionConfigTemplate = ({
  universalIdentifier = v4(),
  name,
  description,
  triggerType = 'route',
}: FunctionConfigTemplateOptions): string => {
  const triggerId = v4();
  const kebabName = kebabCase(name);
  const descriptionLine = description
    ? `\n  description: '${description}',`
    : '';

  let triggerConfig: string;

  switch (triggerType) {
    case 'cron':
      triggerConfig = `{
      universalIdentifier: '${triggerId}',
      type: 'cron',
      pattern: '0 9 * * *', // Every day at 9 AM
    }`;
      break;
    case 'databaseEvent':
      triggerConfig = `{
      universalIdentifier: '${triggerId}',
      type: 'databaseEvent',
      eventName: 'person.created',
    }`;
      break;
    case 'route':
    default:
      triggerConfig = `{
      universalIdentifier: '${triggerId}',
      type: 'route',
      path: '/${kebabName}',
      httpMethod: 'POST',
      isAuthRequired: true,
    }`;
      break;
  }

  return `import { defineFunction } from 'twenty-sdk';

export const config = defineFunction({
  universalIdentifier: '${universalIdentifier}',
  name: '${name}',${descriptionLine}
  timeoutSeconds: 30,
  triggers: [
    ${triggerConfig},
  ],
});

export default async function handler(params: {
  input: string;
}): Promise<{ success: boolean; message: string }> {
  const { input } = params;

  // TODO: Implement your function logic here
  console.log('Function ${name} called with:', input);

  return {
    success: true,
    message: \`Processed: \${input}\`,
  };
}
`;
};
