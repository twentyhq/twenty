import camelcase from 'lodash.camelcase';

export const getObjectDecoratedClass = ({
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

  return `import { Object } from 'twenty-sdk';

@Object({
${decoratorOptions}
})
export class ${className} {}
`;
};
