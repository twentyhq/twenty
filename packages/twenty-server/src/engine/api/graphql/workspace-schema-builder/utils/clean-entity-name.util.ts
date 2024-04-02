import { camelCase } from 'src/utils/camel-case';

export const cleanEntityName = (entityName: string) => {
  // Remove all leading numbers
  let camelCasedEntityName = entityName.replace(/^[0-9]+/, '');

  // Trim the string
  camelCasedEntityName = camelCasedEntityName.trim();

  // Camel case the string
  camelCasedEntityName = camelCase(camelCasedEntityName);

  // Remove all special characters but keep alphabets and numbers
  camelCasedEntityName = camelCasedEntityName.replace(/[^a-zA-Z0-9]/g, '');

  return camelCasedEntityName;
};
