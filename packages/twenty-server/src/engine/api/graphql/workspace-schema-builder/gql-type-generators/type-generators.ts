import { AggregationObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/aggregation-type.factory';
import { ArgsTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/args.factory';
import { CompositeFieldInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/composite-input-type-definition.factory';
import { CompositeFieldObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/composite-object-type-definition.factory';
import { ConnectionObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/connection-type-definition.factory';
import { EdgeObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/edge-type-definition.factory';
import { EnumFieldTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/enum-type-definition.factory';
import { ExtendedObjectMetadataObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/extend-object-type-definition-v2.factory';
import { MutationTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/mutation-type.factory';
import { ObjectMetadataObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/object-type-definition.factory';
import { OrphanedTypesGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/orphaned-types.factory';
import { QueryTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/query-type.factory';
import { RelationConnectInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/relation-connect-input-type-definition.factory';
import { ExtendedRelationObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/relation-type-v2.factory';
import { RootTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/root-type.factory';
import { CompositeFieldEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/composite-field-enum-type.generator';
import { FieldInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/field-input-type.generator';
import { FieldObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/field-object-type.generator';
import { ObjectMetadataInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/object-metadata-input-type.generator';
import { RelationFieldTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/relation-field-type.generator';

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
