import kebabCase from 'lodash.kebabcase';
import { v4 } from 'uuid';

export const getLogicFunctionBaseFile = ({
  name,
  universalIdentifier = v4(),
}: {
  name: string;
  universalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);
  const triggerUniversalIdentifier = v4();

  return `import { defineLogicFunction } from 'twenty-sdk';

// Logic function handler - rename and implement your logic
const handler = async (params: {
  a: string;
  b: number;
}): Promise<{ message: string }> => {
  const { a, b } = params;

  // Replace with your own logic
  const message = \`Hello, input: \${a} and \${b}\`;

  return { message };
};

export default defineLogicFunction({
  universalIdentifier: '${universalIdentifier}',
  name: '${kebabCaseName}',
  description: 'Add a description for your logic function',
  timeoutSeconds: 5,
  handler,
  triggers: [
    // Add your triggers here
    // Route trigger example:
    // {
    //   universalIdentifier: '${triggerUniversalIdentifier}',
    //   type: 'route',
    //   path: '/${kebabCaseName}',
    //   httpMethod: 'POST',
    //   isAuthRequired: true,
    // },
    // Cron trigger example:
    // {
    //   universalIdentifier: '...',
    //   type: 'cron',
    //   pattern: '0 0 * * *', // Daily at midnight
    // },
    // Database event trigger example:
    // {
    //   universalIdentifier: '...',
    //   type: 'databaseEvent',
    //   eventName: 'objectName.created',
    // },
  ],
});
`;
};
