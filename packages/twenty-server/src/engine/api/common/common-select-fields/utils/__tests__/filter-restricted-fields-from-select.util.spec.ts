import { GraphQLInt, GraphQLFloat } from 'graphql';
import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import {
  filterRestrictedFieldsFromAggregate,
  filterRestrictedFieldsFromRelations,
  filterRestrictedFieldsFromSelect,
} from 'src/engine/api/common/common-select-fields/utils/filter-restricted-fields-from-select.util';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
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
    objectMetadataId: 'object-id',
    workspaceId: 'workspace-id',
    isNullable: true,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    universalIdentifier: overrides.id,
    viewFieldIds: [],
    viewFilterIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    applicationId: null,
    label: overrides.name,
    ...overrides,
  }) as FlatFieldMetadata;

const buildFlatFieldMetadataMaps = (
  fields: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> => ({
  byUniversalIdentifier: fields.reduce(
    (acc, field) => {
      acc[field.universalIdentifier] = field;

      return acc;
    },
    {} as Record<string, FlatFieldMetadata>,
  ),
  universalIdentifierById: fields.reduce(
    (acc, field) => {
      acc[field.id] = field.universalIdentifier;

      return acc;
    },
    {} as Record<string, string>,
  ),
  universalIdentifiersByApplicationId: {},
});

const buildFlatObjectMetadata = (fieldIds: string[]): FlatObjectMetadata =>
  ({
    id: 'object-id',
    workspaceId: 'workspace-id',
    nameSingular: 'testObject',
    namePlural: 'testObjects',
    labelSingular: 'Test Object',
    labelPlural: 'Test Objects',
    isCustom: false,
    isRemote: false,
    isActive: true,
    isSystem: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    universalIdentifier: 'object-id',
    fieldIds: fieldIds,
    indexMetadataIds: [],
    viewIds: [],
    applicationId: null,
  }) as unknown as FlatObjectMetadata;

describe('filterRestrictedFieldsFromSelect', () => {
  it('should return original select when no restricted fields', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const field2 = createMockField({
      id: 'field-2',
      name: 'email',
      type: FieldMetadataType.TEXT,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1, field2]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1', 'field-2']);

    const select = { name: true, email: true };

    const result = filterRestrictedFieldsFromSelect({
      select,
      restrictedFields: {},
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(select);
  });

  it('should return original select when restrictedFields is undefined', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1']);

    const select = { name: true };

    const result = filterRestrictedFieldsFromSelect({
      select,
      restrictedFields: undefined,
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(select);
  });

  it('should remove restricted fields from select', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const field2 = createMockField({
      id: 'field-2',
      name: 'email',
      type: FieldMetadataType.TEXT,
    });
    const field3 = createMockField({
      id: 'field-3',
      name: 'ltv',
      type: FieldMetadataType.NUMBER,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      field1,
      field2,
      field3,
    ]);
    const flatObjectMetadata = buildFlatObjectMetadata([
      'field-1',
      'field-2',
      'field-3',
    ]);

    const select = { name: true, email: true, ltv: true };

    const result = filterRestrictedFieldsFromSelect({
      select,
      restrictedFields: {
        'field-3': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ name: true, email: true });
  });

  it('should keep fields not present in select even when allowed', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const field2 = createMockField({
      id: 'field-2',
      name: 'email',
      type: FieldMetadataType.TEXT,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1, field2]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1', 'field-2']);

    const select = { name: true };

    const result = filterRestrictedFieldsFromSelect({
      select,
      restrictedFields: {
        'field-2': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ name: true });
  });

  it('should strip composite sub-columns when parent field is restricted (FULL_NAME)', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const field2 = createMockField({
      id: 'field-2',
      name: 'fullName',
      type: FieldMetadataType.FULL_NAME,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1, field2]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1', 'field-2']);

    // Select contains expanded composite sub-columns (as the GraphQL parser produces)
    const select = {
      name: true,
      fullNameFirstName: true,
      fullNameLastName: true,
    };

    const result = filterRestrictedFieldsFromSelect({
      select,
      restrictedFields: {
        'field-2': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ name: true });
  });

  it('should strip composite sub-columns when parent field is restricted (CURRENCY)', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const field2 = createMockField({
      id: 'field-2',
      name: 'ltv',
      type: FieldMetadataType.CURRENCY,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1, field2]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1', 'field-2']);

    // Select contains expanded CURRENCY sub-columns
    const select = {
      name: true,
      ltvAmountMicros: true,
      ltvCurrencyCode: true,
    };

    const result = filterRestrictedFieldsFromSelect({
      select,
      restrictedFields: {
        'field-2': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ name: true });
  });

  it('should NOT strip unrestricted relation fields when another field is restricted', () => {
    const nameField = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const createdByField = createMockField({
      id: 'field-2',
      name: 'createdBy',
      type: FieldMetadataType.ACTOR,
    });
    const ltvField = createMockField({
      id: 'field-3',
      name: 'ltv',
      type: FieldMetadataType.NUMBER,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      nameField,
      createdByField,
      ltvField,
    ]);
    const flatObjectMetadata = buildFlatObjectMetadata([
      'field-1',
      'field-2',
      'field-3',
    ]);

    // Frontend selects all fields including createdBy
    const select = {
      name: true,
      createdBy: { source: true, workspaceMemberId: true, name: true },
      ltv: true,
    };

    // Only ltv is restricted
    const result = filterRestrictedFieldsFromSelect({
      select,
      restrictedFields: {
        'field-3': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    // createdBy must be preserved, only ltv should be removed
    expect(result).toEqual({
      name: true,
      createdBy: { source: true, workspaceMemberId: true, name: true },
    });
  });

  it('should keep fields not found in metadata (e.g. virtual fields)', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1']);

    const select = { name: true, someVirtualField: true };

    const result = filterRestrictedFieldsFromSelect({
      select,
      restrictedFields: {
        'field-1': { canRead: true },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ name: true, someVirtualField: true });
  });

  it('should strip FK join column when parent relation field is restricted', () => {
    const nameField = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const leadSourceField = createMockField({
      id: 'field-2',
      name: 'leadSource',
      type: FieldMetadataType.RELATION,
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        joinColumnName: 'leadSourceId',
      },
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      nameField,
      leadSourceField,
    ]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1', 'field-2']);

    // Frontend selects both the relation and the FK field
    const select = { name: true, leadSourceId: true };

    const result = filterRestrictedFieldsFromSelect({
      select,
      restrictedFields: {
        'field-2': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    // leadSourceId must be removed because leadSource relation is restricted
    expect(result).toEqual({ name: true });
  });

  it('should keep FK join column when parent relation field is NOT restricted', () => {
    const nameField = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const companyField = createMockField({
      id: 'field-2',
      name: 'company',
      type: FieldMetadataType.RELATION,
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        joinColumnName: 'companyId',
      },
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      nameField,
      companyField,
    ]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1', 'field-2']);

    const select = { name: true, companyId: true };

    const result = filterRestrictedFieldsFromSelect({
      select,
      restrictedFields: {
        'field-1': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    // companyId should be kept, only name should be removed
    expect(result).toEqual({ companyId: true });
  });

  it('should only strip fields with canRead explicitly false', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const field2 = createMockField({
      id: 'field-2',
      name: 'email',
      type: FieldMetadataType.TEXT,
    });
    const field3 = createMockField({
      id: 'field-3',
      name: 'phone',
      type: FieldMetadataType.TEXT,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      field1,
      field2,
      field3,
    ]);
    const flatObjectMetadata = buildFlatObjectMetadata([
      'field-1',
      'field-2',
      'field-3',
    ]);

    const select = { name: true, email: true, phone: true };

    const result = filterRestrictedFieldsFromSelect({
      select,
      restrictedFields: {
        'field-1': { canRead: true },
        'field-2': { canRead: false },
        // field-3 not in restrictedFields at all - should be kept
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ name: true, phone: true });
  });
});

describe('filterRestrictedFieldsFromRelations', () => {
  it('should return undefined when relations is undefined', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1']);

    const result = filterRestrictedFieldsFromRelations({
      relations: undefined,
      restrictedFields: { 'field-1': { canRead: false } },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toBeUndefined();
  });

  it('should return original relations when no restricted fields', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'company',
      type: FieldMetadataType.RELATION,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1']);

    const relations = { company: true };

    const result = filterRestrictedFieldsFromRelations({
      relations,
      restrictedFields: {},
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(relations);
  });

  it('should return original relations when restrictedFields is undefined', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'company',
      type: FieldMetadataType.RELATION,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1']);

    const relations = { company: true };

    const result = filterRestrictedFieldsFromRelations({
      relations,
      restrictedFields: undefined,
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(relations);
  });

  it('should remove restricted relation fields', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'company',
      type: FieldMetadataType.RELATION,
    });
    const field2 = createMockField({
      id: 'field-2',
      name: 'assignedAgent',
      type: FieldMetadataType.RELATION,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1, field2]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1', 'field-2']);

    const relations = { company: true, assignedAgent: true };

    const result = filterRestrictedFieldsFromRelations({
      relations,
      restrictedFields: {
        'field-2': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ company: true });
  });

  it('should keep relation fields that are not restricted', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'company',
      type: FieldMetadataType.RELATION,
    });
    const field2 = createMockField({
      id: 'field-2',
      name: 'assignedAgent',
      type: FieldMetadataType.RELATION,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1, field2]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1', 'field-2']);

    const relations = { company: true, assignedAgent: true };

    const result = filterRestrictedFieldsFromRelations({
      relations,
      restrictedFields: {
        'field-1': { canRead: true },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ company: true, assignedAgent: true });
  });

  it('should keep relations whose field is not in metadata (unknown fields)', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'company',
      type: FieldMetadataType.RELATION,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1']);

    const relations = { company: true, unknownRelation: true };

    const result = filterRestrictedFieldsFromRelations({
      relations,
      restrictedFields: {
        'field-1': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({ unknownRelation: true });
  });
});

describe('filterRestrictedFieldsFromAggregate', () => {
  const createMockAggregation = (
    fromField: string,
    operation: AggregateOperations,
  ): AggregationField => ({
    type: operation === AggregateOperations.COUNT ? GraphQLInt : GraphQLFloat,
    description: `${operation} of ${fromField}`,
    fromField,
    fromFieldType: FieldMetadataType.NUMBER,
    aggregateOperation: operation,
  });

  it('should return original aggregate when no restricted fields', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'id',
      type: FieldMetadataType.UUID,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1']);

    const aggregate: Record<string, AggregationField> = {
      totalCount: createMockAggregation('id', AggregateOperations.COUNT),
    };

    const result = filterRestrictedFieldsFromAggregate({
      aggregate,
      restrictedFields: {},
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(aggregate);
  });

  it('should return original aggregate when restrictedFields is undefined', () => {
    const field1 = createMockField({
      id: 'field-1',
      name: 'id',
      type: FieldMetadataType.UUID,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([field1]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1']);

    const aggregate: Record<string, AggregationField> = {
      totalCount: createMockAggregation('id', AggregateOperations.COUNT),
    };

    const result = filterRestrictedFieldsFromAggregate({
      aggregate,
      restrictedFields: undefined,
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toBe(aggregate);
  });

  it('should remove aggregates on restricted fields', () => {
    const idField = createMockField({
      id: 'field-1',
      name: 'id',
      type: FieldMetadataType.UUID,
    });
    const ltvField = createMockField({
      id: 'field-2',
      name: 'ltv',
      type: FieldMetadataType.NUMBER,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      idField,
      ltvField,
    ]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1', 'field-2']);

    const aggregate: Record<string, AggregationField> = {
      totalCount: createMockAggregation('id', AggregateOperations.COUNT),
      sumLtv: createMockAggregation('ltv', AggregateOperations.SUM),
      avgLtv: createMockAggregation('ltv', AggregateOperations.AVG),
    };

    const result = filterRestrictedFieldsFromAggregate({
      aggregate,
      restrictedFields: {
        'field-2': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      totalCount: aggregate.totalCount,
    });
  });

  it('should keep totalCount even when other fields are restricted', () => {
    const idField = createMockField({
      id: 'field-1',
      name: 'id',
      type: FieldMetadataType.UUID,
    });
    const costField = createMockField({
      id: 'field-2',
      name: 'cost',
      type: FieldMetadataType.NUMBER,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      idField,
      costField,
    ]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1', 'field-2']);

    const aggregate: Record<string, AggregationField> = {
      totalCount: createMockAggregation('id', AggregateOperations.COUNT),
      countEmptyCost: createMockAggregation(
        'cost',
        AggregateOperations.COUNT_EMPTY,
      ),
    };

    const result = filterRestrictedFieldsFromAggregate({
      aggregate,
      restrictedFields: {
        'field-2': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      totalCount: aggregate.totalCount,
    });
    expect(result.totalCount).toBeDefined();
  });

  it('should keep aggregates on fields with canRead true', () => {
    const idField = createMockField({
      id: 'field-1',
      name: 'id',
      type: FieldMetadataType.UUID,
    });
    const ltvField = createMockField({
      id: 'field-2',
      name: 'ltv',
      type: FieldMetadataType.NUMBER,
    });
    const nameField = createMockField({
      id: 'field-3',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      idField,
      ltvField,
      nameField,
    ]);
    const flatObjectMetadata = buildFlatObjectMetadata([
      'field-1',
      'field-2',
      'field-3',
    ]);

    const aggregate: Record<string, AggregationField> = {
      totalCount: createMockAggregation('id', AggregateOperations.COUNT),
      sumLtv: createMockAggregation('ltv', AggregateOperations.SUM),
      countEmptyName: createMockAggregation(
        'name',
        AggregateOperations.COUNT_EMPTY,
      ),
    };

    const result = filterRestrictedFieldsFromAggregate({
      aggregate,
      restrictedFields: {
        'field-2': { canRead: true },
        'field-3': { canRead: false },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      totalCount: aggregate.totalCount,
      sumLtv: aggregate.sumLtv,
    });
  });

  it('should keep aggregates whose fromField is not in metadata', () => {
    const idField = createMockField({
      id: 'field-1',
      name: 'id',
      type: FieldMetadataType.UUID,
    });
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([idField]);
    const flatObjectMetadata = buildFlatObjectMetadata(['field-1']);

    const aggregate: Record<string, AggregationField> = {
      totalCount: createMockAggregation('id', AggregateOperations.COUNT),
      countEmptyUnknown: createMockAggregation(
        'unknownField',
        AggregateOperations.COUNT_EMPTY,
      ),
    };

    const result = filterRestrictedFieldsFromAggregate({
      aggregate,
      restrictedFields: {
        'field-1': { canRead: true },
      },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      totalCount: aggregate.totalCount,
      countEmptyUnknown: aggregate.countEmptyUnknown,
    });
  });
});
