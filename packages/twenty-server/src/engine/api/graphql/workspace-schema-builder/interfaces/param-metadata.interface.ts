import { type GraphQLScalarType } from 'graphql';
import {
  type FieldMetadataType,
  type FieldMetadataDefaultValue,
} from 'twenty-shared/types';

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
