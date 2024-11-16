import { AggregationTypeFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/aggregation-type.factory';
import { CompositeEnumTypeDefinitionFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/composite-enum-type-definition.factory';
import { CompositeInputTypeDefinitionFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/composite-input-type-definition.factory';
import { CompositeObjectTypeDefinitionFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/composite-object-type-definition.factory';
import { EnumTypeDefinitionFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/enum-type-definition.factory';

import { ArgsFactory } from './args.factory';
import { ConnectionTypeDefinitionFactory } from './connection-type-definition.factory';
import { ConnectionTypeFactory } from './connection-type.factory';
import { EdgeTypeDefinitionFactory } from './edge-type-definition.factory';
import { EdgeTypeFactory } from './edge-type.factory';
import { ExtendObjectTypeDefinitionFactory } from './extend-object-type-definition.factory';
import { InputTypeDefinitionFactory } from './input-type-definition.factory';
import { InputTypeFactory } from './input-type.factory';
import { MutationTypeFactory } from './mutation-type.factory';
import { ObjectTypeDefinitionFactory } from './object-type-definition.factory';
import { OrphanedTypesFactory } from './orphaned-types.factory';
import { OutputTypeFactory } from './output-type.factory';
import { QueryTypeFactory } from './query-type.factory';
import { RelationTypeFactory } from './relation-type.factory';
import { RootTypeFactory } from './root-type.factory';

export const workspaceSchemaBuilderFactories = [
  ArgsFactory,
  InputTypeFactory,
  InputTypeDefinitionFactory,
  CompositeInputTypeDefinitionFactory,
  OutputTypeFactory,
  ObjectTypeDefinitionFactory,
  CompositeObjectTypeDefinitionFactory,
  EnumTypeDefinitionFactory,
  CompositeEnumTypeDefinitionFactory,
  RelationTypeFactory,
  ExtendObjectTypeDefinitionFactory,
  ConnectionTypeFactory,
  ConnectionTypeDefinitionFactory,
  EdgeTypeFactory,
  EdgeTypeDefinitionFactory,
  RootTypeFactory,
  QueryTypeFactory,
  MutationTypeFactory,
  OrphanedTypesFactory,
  AggregationTypeFactory,
];
