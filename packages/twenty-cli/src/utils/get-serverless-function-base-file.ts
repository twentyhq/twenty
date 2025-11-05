import kebabCase from 'lodash.kebabcase';
import { v4 } from 'uuid';

export const getServerlessFunctionBaseFile = ({ name }: { name: string }) => {
  const kebabCaseName = kebabCase(name);

  return `import { ServerlessFunctionConfig } from 'twenty-sdk/application';

export const main = async (params: {
  a: string;
  b: number;
}): Promise<{ message: string }> => {
  const { a, b } = params;

  // Rename the parameters and code below with your own logic
  // This is just an example
  const message = \`Hello, input: $\{a} and $\{b}\`;

  return { message };
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: '${v4()}',
  name: '${kebabCaseName}',
  timeoutSeconds: 5,
};

`;
};
