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
    // Add your trigger here
    // Route trigger example:
    // httpRouteTriggerSettings: {
    //   path: '/${kebabCaseName}',
    //   httpMethod: 'POST',
    //   isAuthRequired: true,
    // },
    // Cron trigger example:
    // cronTriggerSettings: {
    //   pattern: '0 0 * * *', // Daily at midnight
    // },
    // Database event trigger example:
    // databaseEventTriggerSettings: {
    //   eventName: 'objectName.created',
    // },
  ],
});
`;
};
