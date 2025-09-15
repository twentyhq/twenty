import { type FieldMetadataType } from 'twenty-shared/types';

import { type GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { pascalCase } from 'src/utils/pascal-case';

export const computeCompositeFieldInputTypeKey = (
  fieldType: FieldMetadataType,
  kind: GqlInputTypeDefinitionKind,
): string => {
  const name = pascalCase(fieldType.toString().toLowerCase());

  return `${pascalCase(name)}${kind.toString()}Input`;
};
