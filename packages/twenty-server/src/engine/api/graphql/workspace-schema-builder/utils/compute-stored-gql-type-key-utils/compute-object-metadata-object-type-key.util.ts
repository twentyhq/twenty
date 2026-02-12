import { pascalCase } from 'twenty-shared/utils';

import { type ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';

export const computeObjectMetadataObjectTypeKey = (
  objectMetadataNameSingular: string,
  kind: ObjectTypeDefinitionKind,
) => {
  return `${pascalCase(objectMetadataNameSingular)}${kind.toString()}`;
};
