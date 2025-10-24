import camelcase from 'lodash.camelcase';

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

  const className = camelCaseName[0].toUpperCase() + camelCaseName.slice(1);

  return `import { ServerlessFunction } from 'twenty-sdk';

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
