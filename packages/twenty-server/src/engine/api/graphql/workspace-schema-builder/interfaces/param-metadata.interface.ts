import { type GraphQLScalarType } from 'graphql';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { type GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';

export interface ArgMetadata {
  kind?: GqlInputTypeDefinitionKind;
  type?: GraphQLScalarType;
  isNullable?: boolean;
  isArray?: boolean;
  defaultValue?: FieldMetadataDefaultValue<FieldMetadataType>;
}

export interface ArgsMetadata {
  args: {
    [key: string]: ArgMetadata;
  };
  objectMetadataSingularName: string;
}
