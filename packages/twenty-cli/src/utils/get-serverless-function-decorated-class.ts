import camelcase from 'lodash.camelcase';
import kebabCase from 'lodash.kebabcase';
import { v4 } from 'uuid';

export const getServerlessFunctionDecoratedClass = ({
  data,
  name,
}: {
  data: object;
  name: string;
}) => {
  const decoratorOptions = Object.entries(data)
    .map(([key, value]) => `  ${key}: '${value}',`)
    .join('\n');

  const camelCaseName = camelcase(name);

  const kebabCaseName = kebabCase(name);

  const className = camelCaseName[0].toUpperCase() + camelCaseName.slice(1);

  return `import { ServerlessFunction } from 'twenty-sdk';

/**
 * Here is your new serverless function
 *
 * ✅Triggers
 *
 * This function can be invoked via a trigger (DatabaseEventTrigger, RouteTrigger, or CronTrigger)
 * once the appropriate trigger decorator is uncommented and configured.
 *
 * import { DatabaseEventTrigger } from 'twenty-sdk';
 * @DatabaseEventTrigger({
 *   universalIdentifier: '${v4()}',
 *   eventName: 'person.created',
 * })
 *
 * import { RouteTrigger } from 'twenty-sdk';
 * @RouteTrigger({
 *   universalIdentifier: '${v4()}',
 *   path: '/trigger-${kebabCaseName}',
 *   httpMethod: 'GET',
 *   isAuthRequired: false,
 * })
 *
 * import { CronTrigger } from 'twenty-sdk';
 * @CronTrigger({
 *   universalIdentifier: '${v4()}',
 *   pattern: '0 * * * *', // Every hour
 * })
 *
 * ✅Environment variables
 *
 * import { ApplicationVariable } from 'twenty-sdk';
 * @ApplicationVariable({
 *   universalIdentifier: '${v4()}',
 *   key: 'ENV_VAR_KEY',
 *   description: '',
 *   isSecret: true,
 * })
 *
 */
@ServerlessFunction({
${decoratorOptions}
})
export class ${className} {
  main = async (params: {
    a: string;
    b: number;
  }): Promise<{ message: string }> => {
    const { a, b } = params;

    // Rename the parameters and code below with your own logic
    // This is just an example
    const message = \`Hello, input: $\{a} and $\{b}\`;

    return { message };
  };
}

export const ${camelCaseName} = new ${className}().main;
`;
};
