import {
  GraphQLID,
  GraphQLObjectType,
  type GraphQLObjectType as GraphQLObjectTypeInstance,
  isObjectType,
} from 'graphql';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { AggregationGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/aggregation-gql-object-type.generator';
import { AggregationObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/aggregation-type.generator';
import { ConnectionGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/connection-gql-object-type.generator';
import { EdgeGqlObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/object-types/edge-gql-object-type.generator';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const createMockField = (
  overrides: Partial<FlatFieldMetadata> & {
    id: string;
    name: string;
    type: FieldMetadataType;
  },
): FlatFieldMetadata =>
  ({
    workspaceId: 'workspace-id',
    universalIdentifier: overrides.id,
    label: overrides.name,
    ...overrides,
  }) as FlatFieldMetadata;

const createMockObject = (
  overrides: Partial<FlatObjectMetadata> & {
    id: string;
    nameSingular: string;
    fieldIds: string[];
  },
): FlatObjectMetadata =>
  ({
    workspaceId: 'workspace-id',
    universalIdentifier: overrides.id,
    description: null,
    ...overrides,
  }) as FlatObjectMetadata;

const buildMaps = <T extends FlatObjectMetadata | FlatFieldMetadata>(
  entities: T[],
): FlatEntityMaps<T> => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map((entity) => [entity.id, entity.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

describe('connection aggregation through a relation', () => {
  const opportunityIdField = createMockField({
    id: 'opportunity-id-field',
    name: 'id',
    type: FieldMetadataType.UUID,
  });
  const opportunityAmountField = createMockField({
    id: 'opportunity-amount-field',
    name: 'amount',
    type: FieldMetadataType.NUMBER,
  });
  const opportunityCompanyField = createMockField({
    id: 'opportunity-company-field',
    name: 'company',
    type: FieldMetadataType.RELATION,
    settings: { relationType: RelationType.MANY_TO_ONE },
    relationTargetObjectMetadataId: 'company-object-id',
  } as Partial<FlatFieldMetadata> & {
    id: string;
    name: string;
    type: FieldMetadataType;
  });
  // Named after an aggregation of the opportunity itself, so it must be skipped
  const opportunitySumAmountField = createMockField({
    id: 'opportunity-sum-amount-field',
    name: 'sumAmount',
    type: FieldMetadataType.RELATION,
    settings: { relationType: RelationType.MANY_TO_ONE },
    relationTargetObjectMetadataId: 'company-object-id',
  } as Partial<FlatFieldMetadata> & {
    id: string;
    name: string;
    type: FieldMetadataType;
  });
  const companyIdField = createMockField({
    id: 'company-id-field',
    name: 'id',
    type: FieldMetadataType.UUID,
  });
  const companyEmployeesField = createMockField({
    id: 'company-employees-field',
    name: 'employees',
    type: FieldMetadataType.NUMBER,
  });
  const companyOpportunitiesField = createMockField({
    id: 'company-opportunities-field',
    name: 'opportunities',
    type: FieldMetadataType.RELATION,
    settings: { relationType: RelationType.ONE_TO_MANY },
    relationTargetObjectMetadataId: 'opportunity-object-id',
  } as Partial<FlatFieldMetadata> & {
    id: string;
    name: string;
    type: FieldMetadataType;
  });

  const opportunityFields = [
    opportunityIdField,
    opportunityAmountField,
    opportunityCompanyField,
    opportunitySumAmountField,
  ];
  const companyFields = [
    companyIdField,
    companyEmployeesField,
    companyOpportunitiesField,
  ];

  const opportunityObject = createMockObject({
    id: 'opportunity-object-id',
    nameSingular: 'opportunity',
    fieldIds: opportunityFields.map((field) => field.id),
  });
  const companyObject = createMockObject({
    id: 'company-object-id',
    nameSingular: 'company',
    fieldIds: companyFields.map((field) => field.id),
  });

  const context: SchemaGenerationContext = {
    flatObjectMetadataMaps: buildMaps([opportunityObject, companyObject]),
    flatFieldMetadataMaps: buildMaps([...opportunityFields, ...companyFields]),
    flatIndexMaps: buildMaps([]),
  };

  let gqlTypesStorage: GqlTypesStorage;

  const getConnectionType = (
    objectNameSingular: string,
  ): GraphQLObjectTypeInstance => {
    const type = gqlTypesStorage.getGqlTypeByKey(
      computeObjectMetadataObjectTypeKey(
        objectNameSingular,
        ObjectTypeDefinitionKind.Connection,
      ),
    );

    if (!isObjectType(type)) {
      throw new Error(`Expected a connection type for ${objectNameSingular}`);
    }

    return type;
  };

  beforeEach(() => {
    gqlTypesStorage = new GqlTypesStorage();

    const aggregationObjectTypeGenerator = new AggregationObjectTypeGenerator();
    const edgeGenerator = new EdgeGqlObjectTypeGenerator(gqlTypesStorage);
    const aggregationGenerator = new AggregationGqlObjectTypeGenerator(
      aggregationObjectTypeGenerator,
      gqlTypesStorage,
    );
    const connectionGenerator = new ConnectionGqlObjectTypeGenerator(
      aggregationObjectTypeGenerator,
      gqlTypesStorage,
    );

    for (const [object, fields] of [
      [opportunityObject, opportunityFields],
      [companyObject, companyFields],
    ] as const) {
      gqlTypesStorage.addGqlType(
        computeObjectMetadataObjectTypeKey(
          object.nameSingular,
          ObjectTypeDefinitionKind.Plain,
        ),
        new GraphQLObjectType({
          name: object.nameSingular,
          fields: { id: { type: GraphQLID } },
        }),
      );
      edgeGenerator.buildAndStore(object);
      aggregationGenerator.buildAndStore(object, fields);
      connectionGenerator.buildAndStore(object, fields, context);
    }
  });

  it('should expose the target aggregation type on a many-to-one relation', () => {
    const connectionFields = getConnectionType('opportunity').getFields();

    expect(String(connectionFields.company.type)).toBe('CompanyAggregation');

    const aggregationType = connectionFields.company.type;

    if (!isObjectType(aggregationType)) {
      throw new Error('Expected CompanyAggregation to be an object type');
    }

    const aggregationFields = aggregationType.getFields();

    expect(String(aggregationFields.sumEmployees.type)).toBe('Float');
    expect(String(aggregationFields.countEmptyEmployees.type)).toBe('Int');
    expect(aggregationFields.opportunities).toBeUndefined();
    expect(aggregationFields.edges).toBeUndefined();
  });

  it('should keep the own aggregations, edges and pageInfo on the connection', () => {
    const connectionFields = getConnectionType('opportunity').getFields();

    expect(String(connectionFields.sumAmount.type)).toBe('Float');
    expect(String(connectionFields.totalCount.type)).toBe('Int');
    expect(String(connectionFields.edges.type)).toBe('[OpportunityEdge!]!');
    expect(String(connectionFields.pageInfo.type)).toBe('PageInfo!');
  });

  it('should not expose an aggregation field for a one-to-many relation', () => {
    const connectionFields = getConnectionType('company').getFields();

    expect(connectionFields.opportunities).toBeUndefined();
  });

  it('should skip a relation whose name collides with a connection field', () => {
    const connectionFields = getConnectionType('opportunity').getFields();

    expect(String(connectionFields.sumAmount.type)).toBe('Float');
  });
});
