import { pascalCase } from 'twenty-shared/utils';

export const computeEnumFieldGqlTypeName = (
  objectMetadataName: string,
  fieldMetadataName: string,
): string => {
  return `${pascalCase(objectMetadataName)}${pascalCase(
    fieldMetadataName,
  )}Enum`;
};

export const disambiguateEnumFieldGqlTypeName = (
  enumTypeName: string,
  fieldMetadataUniversalIdentifier: string,
): string => {
  return `${enumTypeName}_${fieldMetadataUniversalIdentifier.replace(
    /[^_0-9A-Za-z]/g,
    '',
  )}`;
};

export const computeEnumFieldGqlTypeKey = (
  objectMetadataName: string,
  fieldMetadataName: string,
  fieldMetadataUniversalIdentifier: string,
): string => {
  return `${computeEnumFieldGqlTypeName(
    objectMetadataName,
    fieldMetadataName,
  )}:${fieldMetadataUniversalIdentifier}`;
};
