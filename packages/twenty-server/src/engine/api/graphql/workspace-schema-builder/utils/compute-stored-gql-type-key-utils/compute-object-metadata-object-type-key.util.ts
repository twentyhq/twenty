import { type ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { pascalCase } from 'src/utils/pascal-case';

export const computeObjectMetadataObjectTypeKey = (
  objectMetadataNameSingular: string,
  kind: ObjectTypeDefinitionKind,
) => {
  return `${pascalCase(objectMetadataNameSingular)}${kind.toString()}`;
};
