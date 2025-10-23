import camelcase from 'lodash.camelcase';

export const getDecoratedClass = ({
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

  return `import { ObjectMetadata } from 'twenty-sdk';

@ObjectMetadata({
${decoratorOptions}
})
export class ${className} {}
`;
};
