import {
  getNamedType,
  type GraphQLNamedType,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  isUnionType,
  specifiedScalarTypes,
} from 'graphql';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { GqlOperation } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-operation.enum';
import { CompositeFieldMetadataGqlEnumTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/enum-types/composite-field-metadata-gql-enum-type.generator';
import { CompositeFieldMetadataCreateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/create-input/composite-field-metadata-create-gql-input-type.generator';
import { CompositeFieldMetadataFilterGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/filter-input/composite-field-metadata-filter-gql-input-types.generator';
import { CompositeFieldMetadataGroupByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/group-by-input/composite-field-metadata-group-by-gql-input-type.generator';
import { GroupByDateGranularityInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/group-by-input/group-by-date-granularity-gql-input-type.generator';
import { CompositeFieldMetadataOrderByGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/composite-field-metadata-order-by-gql-input-type.generator';
import { CompositeFieldMetadataUpdateGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/update-input/composite-field-metadata-update-gql-input-type.generator';
import { CompositeFieldMetadataGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/composite-field-metadata-gql-object-type.generator';
import { PageInfoType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/object';
import * as WorkspaceInputTypes from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/input';
import * as WorkspaceEnumTypes from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/enum';
import { scalars } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';

export const getWorkspaceApiSharedTypeNames = (): string[] => {
  const gqlTypesStorage = new GqlTypesStorage();
  const typeMapperService = new TypeMapperService();
  const compositeGenerators = [
    new CompositeFieldMetadataGqlEnumTypeGenerator(gqlTypesStorage),
    new CompositeFieldMetadataGqlObjectTypeGenerator(
      gqlTypesStorage,
      typeMapperService,
    ),
    new CompositeFieldMetadataCreateGqlInputTypeGenerator(
      gqlTypesStorage,
      typeMapperService,
    ),
    new CompositeFieldMetadataUpdateGqlInputTypeGenerator(
      gqlTypesStorage,
      typeMapperService,
    ),
    new CompositeFieldMetadataFilterGqlInputTypeGenerator(
      gqlTypesStorage,
      typeMapperService,
    ),
    new CompositeFieldMetadataOrderByGqlInputTypeGenerator(
      gqlTypesStorage,
      typeMapperService,
    ),
    new CompositeFieldMetadataGroupByGqlInputTypeGenerator(
      gqlTypesStorage,
      typeMapperService,
    ),
  ];

  for (const compositeType of structuredClone([
    ...compositeTypeDefinitions.values(),
  ])) {
    for (const generator of compositeGenerators) {
      generator.buildAndStore(compositeType);
    }
  }

  new GroupByDateGranularityInputTypeGenerator(gqlTypesStorage).buildAndStore();

  const scalarAndFilterTypes = Object.values(FieldMetadataType)
    .flatMap((fieldMetadataType) => [
      typeMapperService.mapToPreBuiltGraphQLOutputType({ fieldMetadataType }),
      typeMapperService.mapToPreBuiltGraphQLInputType({ fieldMetadataType }),
      typeMapperService.mapToFilterType(fieldMetadataType),
      typeMapperService.mapToOrderByType(fieldMetadataType),
    ])
    .filter(isDefined)
    .map((type) => getNamedType(type));
  const pendingTypes: GraphQLNamedType[] = [
    ...specifiedScalarTypes,
    ...scalars,
    PageInfoType,
    ...Object.values(WorkspaceInputTypes),
    ...Object.values(WorkspaceEnumTypes),
    ...gqlTypesStorage.getAllGqlTypesExcept([]),
    ...scalarAndFilterTypes,
  ];
  const visitedTypes = new Set<GraphQLNamedType>();
  const typeNames = new Set<string>(Object.values(GqlOperation));

  while (pendingTypes.length > 0) {
    const type = pendingTypes.pop();

    if (!isDefined(type) || visitedTypes.has(type)) {
      continue;
    }

    visitedTypes.add(type);
    typeNames.add(type.name);

    if (isUnionType(type)) {
      pendingTypes.push(...type.getTypes());
      continue;
    }

    if (isInputObjectType(type)) {
      for (const field of Object.values(type.getFields())) {
        pendingTypes.push(getNamedType(field.type));
      }
      continue;
    }

    if (!isObjectType(type) && !isInterfaceType(type)) {
      continue;
    }

    pendingTypes.push(...type.getInterfaces());
    for (const field of Object.values(type.getFields())) {
      pendingTypes.push(getNamedType(field.type));
      for (const argument of field.args) {
        pendingTypes.push(getNamedType(argument.type));
      }
    }
  }

  return [...typeNames];
};
