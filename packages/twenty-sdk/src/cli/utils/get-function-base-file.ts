import kebabCase from 'lodash.kebabcase';
import { v4 } from 'uuid';

export const getFunctionBaseFile = ({
  name,
  universalIdentifier = v4(),
}: {
  name: string;
  universalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);

  return `import { type FunctionConfig } from 'twenty-sdk';

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

export const config: FunctionConfig = {
  universalIdentifier: '${universalIdentifier}',
  name: '${kebabCaseName}',
  timeoutSeconds: 5,
  triggers: [],
};

`;
};
