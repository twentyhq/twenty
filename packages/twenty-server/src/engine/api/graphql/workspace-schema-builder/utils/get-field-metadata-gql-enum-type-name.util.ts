import { pascalCase } from 'twenty-shared/utils';

export const getFieldMetadataGqlEnumTypeName = ({
  objectName,
  fieldName,
}: {
  objectName: string;
  fieldName: string;
}) => `${pascalCase(objectName)}${pascalCase(fieldName)}Enum`;
