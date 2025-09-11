import { type FieldMetadataType } from 'twenty-shared/types';

import { type InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/input-type-definition-kind.enum';
import { pascalCase } from 'src/utils/pascal-case';

export const computeCompositeFieldInputTypeKey = (
  subFieldType: FieldMetadataType,
  kind: InputTypeDefinitionKind,
): string => {
  const name = pascalCase(subFieldType.toString().toLowerCase());

  return `${pascalCase(name)}${kind.toString()}Input`;
};
