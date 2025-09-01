import { InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory';
import { type ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/object-type-definition.factory';

export const isInputTypeDefinitionKind = (
  kind: InputTypeDefinitionKind | ObjectTypeDefinitionKind,
): kind is InputTypeDefinitionKind => {
  return Object.values(InputTypeDefinitionKind).includes(
    kind as InputTypeDefinitionKind,
  );
};
