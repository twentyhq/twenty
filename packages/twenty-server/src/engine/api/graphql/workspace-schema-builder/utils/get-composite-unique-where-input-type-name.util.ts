import { pascalCase } from 'twenty-shared/utils';

export const getCompositeUniqueWhereInputTypeName = ({
  objectName,
  fieldName,
}: {
  objectName: string;
  fieldName: string;
}) => `${pascalCase(objectName)}${pascalCase(fieldName)}WhereInput`;
