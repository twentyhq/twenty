import {
  AggregateOperations,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';

import { GraphqlQuerySelectedFieldsParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const createMockField = (
  overrides: Partial<FlatFieldMetadata> & {
    id: string;
    name: string;
    type: FieldMetadataType;
    objectMetadataId: string;
  },
): FlatFieldMetadata =>
  ({
    workspaceId: 'workspace-id',
    universalIdentifier: overrides.id,
    label: overrides.name,
    ...overrides,
  }) as FlatFieldMetadata;

const buildFieldMaps = (
  fields: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    fields.map((field) => [field.universalIdentifier, field]),
  ),
  universalIdentifierById: Object.fromEntries(
    fields.map((field) => [field.id, field.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

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
    ...overrides,
  }) as FlatObjectMetadata;

const buildObjectMaps = (
  objects: FlatObjectMetadata[],
): FlatEntityMaps<FlatObjectMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    objects.map((object) => [object.universalIdentifier, object]),
  ),
  universalIdentifierById: Object.fromEntries(
    objects.map((object) => [object.id, object.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

describe('GraphqlQuerySelectedFieldsAggregateParser through a relation', () => {
  const opportunityIdField = createMockField({
    id: 'opportunity-id-field',
    name: 'id',
    type: FieldMetadataType.UUID,
    objectMetadataId: 'opportunity-object-id',
  });
  const opportunityCompanyField = createMockField({
    id: 'opportunity-company-field',
    name: 'company',
    type: FieldMetadataType.RELATION,
    objectMetadataId: 'opportunity-object-id',
    settings: { relationType: RelationType.MANY_TO_ONE },
    relationTargetObjectMetadataId: 'company-object-id',
  } as Partial<FlatFieldMetadata> & {
    id: string;
    name: string;
    type: FieldMetadataType;
    objectMetadataId: string;
  });
  const companyIdField = createMockField({
    id: 'company-id-field',
    name: 'id',
    type: FieldMetadataType.UUID,
    objectMetadataId: 'company-object-id',
  });
  const companyNameField = createMockField({
    id: 'company-name-field',
    name: 'name',
    type: FieldMetadataType.TEXT,
    objectMetadataId: 'company-object-id',
  });
  const companyEmployeesField = createMockField({
    id: 'company-employees-field',
    name: 'employees',
    type: FieldMetadataType.NUMBER,
    objectMetadataId: 'company-object-id',
  });
  const companyOpportunitiesField = createMockField({
    id: 'company-opportunities-field',
    name: 'opportunities',
    type: FieldMetadataType.RELATION,
    objectMetadataId: 'company-object-id',
    settings: { relationType: RelationType.ONE_TO_MANY },
    relationTargetObjectMetadataId: 'opportunity-object-id',
  } as Partial<FlatFieldMetadata> & {
    id: string;
    name: string;
    type: FieldMetadataType;
    objectMetadataId: string;
  });

  const opportunityObject = createMockObject({
    id: 'opportunity-object-id',
    nameSingular: 'opportunity',
    fieldIds: ['opportunity-id-field', 'opportunity-company-field'],
  });
  const companyObject = createMockObject({
    id: 'company-object-id',
    nameSingular: 'company',
    fieldIds: [
      'company-id-field',
      'company-name-field',
      'company-employees-field',
      'company-opportunities-field',
    ],
  });

  const fieldMaps = buildFieldMaps([
    opportunityIdField,
    opportunityCompanyField,
    companyIdField,
    companyNameField,
    companyEmployeesField,
    companyOpportunitiesField,
  ]);
  const objectMaps = buildObjectMaps([opportunityObject, companyObject]);

  const buildParser = () =>
    new GraphqlQuerySelectedFieldsParser(objectMaps, fieldMaps);

  it('should store a connection-level relation sub-selection as aggregates through the relation', () => {
    const result = buildParser().parse(
      {
        totalCount: true,
        company: { sumEmployees: true, countEmptyName: true },
        edges: { node: { id: true } },
      },
      opportunityObject,
    );

    expect(result.aggregate.totalCount).toMatchObject({
      fromField: 'id',
      aggregateOperation: AggregateOperations.COUNT,
    });
    expect(result.aggregate['company.sumEmployees']).toMatchObject({
      fromField: 'employees',
      fromFieldType: FieldMetadataType.NUMBER,
      aggregateOperation: AggregateOperations.SUM,
      throughRelation: {
        relationFieldName: 'company',
        relationFieldMetadata: opportunityCompanyField,
        targetObjectMetadata: companyObject,
        targetFieldMetadata: companyEmployeesField,
        targetAggregationName: 'sumEmployees',
      },
    });
    expect(result.aggregate['company.countEmptyName']).toMatchObject({
      fromField: 'name',
      aggregateOperation: AggregateOperations.COUNT_EMPTY,
      throughRelation: { targetAggregationName: 'countEmptyName' },
    });
    expect(result.aggregate.company).toBeUndefined();
    expect(result.relations).toEqual({});
    expect(result.select).toEqual({ id: true });
  });

  it('should parse aggregates through the relation when the connection selects no edges', () => {
    // The aggregate footer query selects aggregates only
    const result = buildParser().parse(
      { company: { avgEmployees: true } },
      opportunityObject,
    );

    expect(result.aggregate['company.avgEmployees']).toMatchObject({
      aggregateOperation: AggregateOperations.AVG,
      throughRelation: { relationFieldName: 'company' },
    });
    expect(result.relations).toEqual({});
    expect(result.select).toEqual({});
    expect(result.relationFieldsCount).toBe(0);
  });

  it('should keep a node-level relation selection as a relation', () => {
    const result = buildParser().parse(
      { edges: { node: { id: true, company: { name: true } } } },
      opportunityObject,
    );

    expect(result.relations.company).toBeDefined();
    expect(result.select.company).toEqual({ id: true, name: true });
    expect(
      Object.keys(result.aggregate).filter((key) => key.startsWith('company.')),
    ).toEqual([]);
  });

  it('should treat a sub-selection mixing record fields and aggregation names as a relation', () => {
    const result = buildParser().parse(
      { id: true, company: { name: true, sumEmployees: true } },
      opportunityObject,
    );

    expect(result.relations.company).toBeDefined();
    expect(result.aggregate['company.sumEmployees']).toBeUndefined();
  });

  it('should not traverse a one-to-many relation', () => {
    const result = buildParser().parse(
      { opportunities: { totalCount: true } },
      companyObject,
    );

    expect(result.aggregate['opportunities.totalCount']).toBeUndefined();
    expect(result.relations.opportunities).toBeDefined();
    expect(result.aggregate.opportunities).toMatchObject({
      totalCount: { aggregateOperation: AggregateOperations.COUNT },
    });
  });
});
