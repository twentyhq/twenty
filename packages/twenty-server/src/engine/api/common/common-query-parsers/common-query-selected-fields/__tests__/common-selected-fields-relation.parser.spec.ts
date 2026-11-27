import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { computeSelectionKey } from 'src/engine/api/graphql/workspace-resolver-builder/utils/compute-selection-key.util';
import { CommonQuerySelectedFieldsParser } from 'src/engine/api/common/common-query-parsers/common-query-selected-fields/common-selected-fields.parser';
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

describe('CommonQuerySelectedFieldsParser relation fields', () => {
  const leadIdField = createMockField({
    id: 'lead-id-field',
    name: 'id',
    type: FieldMetadataType.UUID,
  });
  const fundField = createMockField({
    id: 'fund-field',
    name: 'fund',
    type: FieldMetadataType.RELATION,
    settings: { relationType: RelationType.ONE_TO_MANY },
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
  const companyNameField = createMockField({
    id: 'company-name-field',
    name: 'name',
    type: FieldMetadataType.TEXT,
  });

  const investorLeadObject = createMockObject({
    id: 'investor-lead-object-id',
    nameSingular: 'investorLead',
    fieldIds: ['lead-id-field', 'fund-field'],
  });
  const companyObject = createMockObject({
    id: 'company-object-id',
    nameSingular: 'company',
    fieldIds: ['company-id-field', 'company-name-field'],
  });

  const fieldMaps = buildFieldMaps([
    leadIdField,
    fundField,
    companyIdField,
    companyNameField,
  ]);
  const objectMaps = buildObjectMaps([investorLeadObject, companyObject]);

  it('should ignore a relation selected as a boolean', () => {
    // Boolean selections carry no sub-fields; only the object form hydrates
    const parser = new CommonQuerySelectedFieldsParser({
      flatObjectMetadataMaps: objectMaps,
      flatFieldMetadataMaps: fieldMaps,
    });

    const result = parser.parse({
      selectedFields: {
        fields: { id: true, fund: true },
        aggregates: [],
        relations: {},
      },
      flatObjectMetadata: investorLeadObject,
    });

    expect(result.columns).toEqual({ id: true });
    expect(result.relations).toEqual({});
    expect(result.relationFieldsCount).toBe(0);
  });

  it('should hydrate a relation selected as a nested object', () => {
    const parser = new CommonQuerySelectedFieldsParser({
      flatObjectMetadataMaps: objectMaps,
      flatFieldMetadataMaps: fieldMaps,
    });

    const result = parser.parse({
      selectedFields: {
        fields: { id: true },
        aggregates: [],
        relations: {
          fund: {
            fieldName: 'fund',
            selectedFields: {
              fields: { id: true, name: true },
              aggregates: [],
              relations: {},
            },
          },
        },
      },
      flatObjectMetadata: investorLeadObject,
    });

    expect(result.columns).toEqual({ id: true });
    expect(result.relations.fund).toEqual({
      fieldName: 'fund',
      selection: {
        columns: { id: true, name: true },
        aggregates: {},
        relations: {},
      },
    });
    expect(result.relationFieldsCount).toBe(1);
  });

  it('should build one relation selection per selection key', () => {
    const parser = new CommonQuerySelectedFieldsParser({
      flatObjectMetadataMaps: objectMaps,
      flatFieldMetadataMaps: fieldMaps,
    });
    const firstFundKey = computeSelectionKey({
      fieldName: 'fund',
      arguments: { first: 2 },
    });

    const result = parser.parse({
      selectedFields: {
        fields: { id: true },
        aggregates: [],
        relations: {
          fund: {
            fieldName: 'fund',
            selectedFields: {
              fields: { name: true },
              aggregates: ['edges'],
              relations: {},
            },
          },
          [firstFundKey]: {
            fieldName: 'fund',
            arguments: { first: 2 },
            selectedFields: {
              fields: {},
              aggregates: ['edges'],
              relations: {},
            },
          },
        },
      },
      flatObjectMetadata: investorLeadObject,
    });

    expect(result.columns).toEqual({ id: true });
    expect(Object.keys(result.relations)).toEqual(['fund', firstFundKey]);
    expect(result.relations.fund).toMatchObject({
      fieldName: 'fund',
      selection: { columns: { id: true, name: true } },
    });
    expect(result.relations[firstFundKey]).toMatchObject({
      fieldName: 'fund',
      first: 2,
      selection: { columns: { id: true } },
    });
    expect(result.relationFieldsCount).toBe(2);
  });
});
