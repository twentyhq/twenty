import { FieldMetadataType } from 'twenty-shared/types';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { type TypeOptions } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const computeFieldInputTypeOptions = <T extends FieldMetadataType>(
  fieldMetadata: FieldMetadataEntity<T>,
  kind: GqlInputTypeDefinitionKind,
): TypeOptions => {
  return {
    nullable: fieldMetadata.isNullable ?? undefined,
    defaultValue: fieldMetadata.defaultValue,
    isArray:
      kind !== GqlInputTypeDefinitionKind.Filter &&
      fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
    settings: fieldMetadata.settings,
    isIdField: fieldMetadata.name === 'id',
  };
};
