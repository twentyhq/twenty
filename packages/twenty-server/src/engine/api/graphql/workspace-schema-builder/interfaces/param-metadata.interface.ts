import { GraphQLScalarType } from 'graphql';

import { InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory';

export interface ArgMetadata<T = any> {
  kind?: InputTypeDefinitionKind;
  type?: GraphQLScalarType;
  isNullable?: boolean;
  isArray?: boolean;
  defaultValue?: T;
}

export interface ArgsMetadata {
  args: {
    [key: string]: ArgMetadata;
  };
  objectMetadataId: string;
}
