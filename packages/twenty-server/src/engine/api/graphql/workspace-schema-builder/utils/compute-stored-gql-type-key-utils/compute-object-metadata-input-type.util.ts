import { type InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/input-type-definition-kind.enum';
import { pascalCase } from 'src/utils/pascal-case';

export const computeObjectMetadataInputTypeKey = (
  objectMetadataNameSingular: string,
  kind: InputTypeDefinitionKind,
) => {
  return `${pascalCase(objectMetadataNameSingular)}${kind.toString()}Input`;
};
