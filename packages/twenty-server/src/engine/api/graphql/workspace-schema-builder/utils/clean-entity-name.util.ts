import { camelCase } from 'src/utils/camel-case';

export const cleanEntityName = (entityName: string) => {
  let camelCasedEntityName = entityName.replace(/^[0-9]+/, '');

  camelCasedEntityName = camelCasedEntityName.trim();

  camelCasedEntityName = camelCase(camelCasedEntityName);

  camelCasedEntityName = camelCasedEntityName.replace(/[^a-zA-Z0-9]/g, '');

  return camelCasedEntityName;
};
