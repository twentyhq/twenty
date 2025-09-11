import { AggregationObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/aggregation-type.generator';
import { ArgsTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/args-type.generator';
import { CompositeFieldEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/composite-field-enum-type.generator';
import { CompositeFieldInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/composite-field-input-type.generator';
import { CompositeFieldObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/composite-field-object-type.generator';
import { ConnectionObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/connection-object-type.generator';
import { EdgeObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/edge-object-type.generator';
import { EnumFieldTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/enum-field-type.generator';
import { ExtendedObjectMetadataObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/extended-object-metadata-object-type.generator';
import { ExtendedRelationObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/extended-relation-object-type.generator';
import { FieldInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/field-input-type.generator';
import { FieldObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/field-object-type.generator';
import { MutationTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/mutation-type.generator';
import { ObjectMetadataInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-metadata-input-type.generator';
import { ObjectMetadataObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-metadata-object-type.generator';
import { OrphanedTypesGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/orphaned-types.generator';
import { QueryTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/query-type.generator';
import { RelationConnectInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/relation-connect-input-type.generator';
import { RelationFieldTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/relation-field-type.generator';
import { RootTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/root-type.generator';

export const workspaceSchemaBuilderTypeGenerators = [
  CompositeFieldEnumTypeGenerator,
  EnumFieldTypeGenerator,
  FieldObjectTypeGenerator,
  CompositeFieldObjectTypeGenerator,
  FieldInputTypeGenerator,
  CompositeFieldInputTypeGenerator,
  RelationFieldTypeGenerator,
  ObjectMetadataObjectTypeGenerator,
  EdgeObjectTypeGenerator,
  ConnectionObjectTypeGenerator,
  ExtendedRelationObjectTypeGenerator,
  AggregationObjectTypeGenerator,
  ArgsTypeGenerator,
  ExtendedObjectMetadataObjectTypeGenerator,
  RelationConnectInputTypeGenerator,
  ObjectMetadataInputTypeGenerator,
  RootTypeGenerator,
  QueryTypeGenerator,
  MutationTypeGenerator,
  OrphanedTypesGenerator,
];
