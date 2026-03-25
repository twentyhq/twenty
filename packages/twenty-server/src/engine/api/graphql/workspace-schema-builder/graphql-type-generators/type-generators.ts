import { WorkspaceResolverBuilderService } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.service';
import { ArgsTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/args-type/args-type.generator';
import { CompositeFieldMetadataGqlEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/enum-types/composite-field-metadata-gql-enum-type.generator';
import { EnumFieldMetadataGqlEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/enum-types/enum-field-metadata-gql-enum-type.generator';
import { CompositeFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/composite-field-metadata-gql-input-type.generator';
import { CompositeFieldMetadataCreateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/create-input/composite-field-metadata-create-gql-input-type.generator';
import { ObjectMetadataCreateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/create-input/object-metadata-create-gql-input-type.generator';
import { CompositeFieldMetadataFilterGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/filter-input/composite-field-metadata-filter-gql-input-types.generator';
import { ObjectMetadataFilterGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/filter-input/object-metadata-filter-gql-input-type.generator';
import { CompositeFieldMetadataGroupByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/group-by-input/composite-field-metadata-group-by-gql-input-type.generator';
import { GroupByDateGranularityInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/group-by-input/group-by-date-granularity-gql-input-type.generator';
import { ObjectMetadataGroupByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/group-by-input/object-metadata-group-by-gql-input-type.generator';
import { ObjectMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/object-metadata-gql-input-type.generator';
import { CompositeFieldMetadataOrderByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/composite-field-metadata-order-by-gql-input-type.generator';
import { ObjectMetadataOrderByBaseGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/object-metadata-order-by-base.generator';
import { ObjectMetadataOrderByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/object-metadata-order-by-gql-input-type.generator';
import { ObjectMetadataOrderByWithGroupByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/object-metadata-order-by-with-group-by-gql-input-type.generator';
import { RelationConnectGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/relation-connect-gql-input-type.generator';
import { RelationFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/relation-field-metadata-gql-type.generator';
import { CompositeFieldMetadataUpdateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/update-input/composite-field-metadata-update-gql-input-type.generator';
import { ObjectMetadataUpdateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/update-input/object-metadata-update-gql-input-type.generator';
import { AggregationObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/aggregation-type.generator';
import { CompositeFieldMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/composite-field-metadata-gql-object-type.generator';
import { ConnectionGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/connection-gql-object-type.generator';
import { EdgeGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/edge-gql-object-type.generator';
import { GroupByConnectionGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/group-by-connection-gql-object-type.generator';
import { ObjectMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/object-metadata-gql-object-type.generator';
import { ObjectMetadataWithRelationsGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/object-metadata-with-relations-gql-object-type.generator';
import { RelationFieldMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/relation-field-metadata-gql-object-type.generator';
import { MutationTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/root-types/mutation-type.generator';
import { QueryTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/root-types/query-type.generator';
import { RootTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/root-types/root-type.generator';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';

export const instantiateTypeGenerators = (
  gqlTypesStorage: GqlTypesStorage,
  typeMapperService: TypeMapperService,
  workspaceResolverBuilderService: WorkspaceResolverBuilderService,
) => {
  const argsTypeGenerator = new ArgsTypeGenerator(gqlTypesStorage);

  const relationFieldMetadataGqlObjectTypeGenerator =
    new RelationFieldMetadataGqlObjectTypeGenerator(typeMapperService);

  const relationFieldMetadataGqlInputTypeGenerator =
    new RelationFieldMetadataGqlInputTypeGenerator(
      typeMapperService,
      gqlTypesStorage,
    );

  const compositeFieldMetadataCreateGqlInputTypeGenerator =
    new CompositeFieldMetadataCreateGqlInputTypeGenerator(
      gqlTypesStorage,
      typeMapperService,
    );
  const compositeFieldMetadataUpdateGqlInputTypeGenerator =
    new CompositeFieldMetadataUpdateGqlInputTypeGenerator(
      gqlTypesStorage,
      typeMapperService,
    );
  const compositeFieldMetadataFilterGqlInputTypeGenerator =
    new CompositeFieldMetadataFilterGqlInputTypeGenerator(
      gqlTypesStorage,
      typeMapperService,
    );
  const compositeFieldMetadataOrderByGqlInputTypeGenerator =
    new CompositeFieldMetadataOrderByGqlInputTypeGenerator(
      gqlTypesStorage,
      typeMapperService,
    );
  const compositeFieldMetadataGroupByGqlInputTypeGenerator =
    new CompositeFieldMetadataGroupByGqlInputTypeGenerator(
      gqlTypesStorage,
      typeMapperService,
    );

  const objectMetadataOrderByBaseGenerator =
    new ObjectMetadataOrderByBaseGenerator(
      gqlTypesStorage,
      relationFieldMetadataGqlInputTypeGenerator,
      typeMapperService,
    );

  const rootTypeGenerator = new RootTypeGenerator(
    gqlTypesStorage,
    argsTypeGenerator,
    workspaceResolverBuilderService,
  );

  return {
    enumFieldMetadataGqlEnumTypeGenerator:
      new EnumFieldMetadataGqlEnumTypeGenerator(gqlTypesStorage),
    compositeFieldMetadataGqlEnumTypeGenerator:
      new CompositeFieldMetadataGqlEnumTypeGenerator(gqlTypesStorage),
    compositeFieldMetadataGqlObjectTypeGenerator:
      new CompositeFieldMetadataGqlObjectTypeGenerator(
        gqlTypesStorage,
        typeMapperService,
      ),
    compositeFieldMetadataGqlInputTypeGenerator:
      new CompositeFieldMetadataGqlInputTypeGenerator(
        compositeFieldMetadataCreateGqlInputTypeGenerator,
        compositeFieldMetadataUpdateGqlInputTypeGenerator,
        compositeFieldMetadataFilterGqlInputTypeGenerator,
        compositeFieldMetadataOrderByGqlInputTypeGenerator,
        compositeFieldMetadataGroupByGqlInputTypeGenerator,
      ),
    objectMetadataGqlObjectTypeGenerator:
      new ObjectMetadataGqlObjectTypeGenerator(
        relationFieldMetadataGqlObjectTypeGenerator,
        gqlTypesStorage,
        typeMapperService,
      ),
    objectMetadataGqlInputTypeGenerator:
      new ObjectMetadataGqlInputTypeGenerator(
        new ObjectMetadataCreateGqlInputTypeGenerator(
          gqlTypesStorage,
          relationFieldMetadataGqlInputTypeGenerator,
          typeMapperService,
        ),
        new ObjectMetadataUpdateGqlInputTypeGenerator(
          gqlTypesStorage,
          relationFieldMetadataGqlInputTypeGenerator,
          typeMapperService,
        ),
        new ObjectMetadataFilterGqlInputTypeGenerator(
          gqlTypesStorage,
          relationFieldMetadataGqlInputTypeGenerator,
          typeMapperService,
        ),
        new ObjectMetadataOrderByGqlInputTypeGenerator(
          gqlTypesStorage,
          objectMetadataOrderByBaseGenerator,
        ),
        new ObjectMetadataOrderByWithGroupByGqlInputTypeGenerator(
          gqlTypesStorage,
          relationFieldMetadataGqlInputTypeGenerator,
          objectMetadataOrderByBaseGenerator,
          typeMapperService,
        ),
        new ObjectMetadataGroupByGqlInputTypeGenerator(
          gqlTypesStorage,
          relationFieldMetadataGqlInputTypeGenerator,
          typeMapperService,
        ),
      ),
    edgeGqlObjectTypeGenerator: new EdgeGqlObjectTypeGenerator(gqlTypesStorage),
    connectionGqlObjectTypeGenerator: new ConnectionGqlObjectTypeGenerator(
      new AggregationObjectTypeGenerator(),
      gqlTypesStorage,
    ),
    groupByConnectionGqlObjectTypeGenerator:
      new GroupByConnectionGqlObjectTypeGenerator(gqlTypesStorage),
    objectMetadataWithRelationsGqlObjectTypeGenerator:
      new ObjectMetadataWithRelationsGqlObjectTypeGenerator(
        argsTypeGenerator,
        gqlTypesStorage,
      ),
    relationConnectGqlInputTypeGenerator:
      new RelationConnectGqlInputTypeGenerator(
        typeMapperService,
        gqlTypesStorage,
      ),
    groupByDateGranularityInputTypeGenerator:
      new GroupByDateGranularityInputTypeGenerator(gqlTypesStorage),
    queryTypeGenerator: new QueryTypeGenerator(
      rootTypeGenerator,
      gqlTypesStorage,
    ),
    mutationTypeGenerator: new MutationTypeGenerator(
      rootTypeGenerator,
      gqlTypesStorage,
    ),
  };
};

export type TypeGenerators = ReturnType<typeof instantiateTypeGenerators>;
