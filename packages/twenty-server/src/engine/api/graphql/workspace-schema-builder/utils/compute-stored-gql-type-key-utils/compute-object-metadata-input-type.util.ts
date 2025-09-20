import { type GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { pascalCase } from 'src/utils/pascal-case';

export const computeObjectMetadataInputTypeKey = (
  objectMetadataNameSingular: string,
  kind: GqlInputTypeDefinitionKind,
) => {
  return `${pascalCase(objectMetadataNameSingular)}${kind.toString()}Input`;
};
