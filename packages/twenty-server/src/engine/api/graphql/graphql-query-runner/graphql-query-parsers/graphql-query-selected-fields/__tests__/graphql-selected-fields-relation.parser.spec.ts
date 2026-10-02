import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { GraphqlQuerySelectedFieldsParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
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

describe('GraphqlQuerySelectedFieldsParser relation fields', () => {
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
  const ownerField = createMockField({
    id: 'owner-field',
    name: 'owner',
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
  const companyNameField = createMockField({
    id: 'company-name-field',
    name: 'name',
    type: FieldMetadataType.TEXT,
  });

  const parentCompanyField = createMockField({
    id: 'parent-company-field',
    name: 'parentCompany',
    type: FieldMetadataType.RELATION,
    settings: { relationType: RelationType.MANY_TO_ONE },
    relationTargetObjectMetadataId: 'company-object-id',
  } as Partial<FlatFieldMetadata> & {
    id: string;
    name: string;
    type: FieldMetadataType;
  });

  const investorLeadObject = createMockObject({
    id: 'investor-lead-object-id',
    nameSingular: 'investorLead',
    fieldIds: ['lead-id-field', 'fund-field', 'owner-field'],
  });
  const companyObject = createMockObject({
    id: 'company-object-id',
    nameSingular: 'company',
    fieldIds: [
      'company-id-field',
      'company-name-field',
      'parent-company-field',
    ],
  });

  const fieldMaps = buildFieldMaps([
    leadIdField,
    fundField,
    ownerField,
    companyIdField,
    companyNameField,
    parentCompanyField,
  ]);
  const objectMaps = buildObjectMaps([investorLeadObject, companyObject]);

  it('should ignore a relation selected as a boolean', () => {
    // Boolean selections carry no sub-fields; only the object form hydrates
    const parser = new GraphqlQuerySelectedFieldsParser(objectMaps, fieldMaps);

    const result = parser.parse({ id: true, fund: true }, investorLeadObject);

    expect(result.select).toEqual({ id: true });
    expect(result.relations).toEqual({});
    expect(result.relationFieldsCount).toBe(0);
  });

  it('should hydrate a relation selected as a nested object', () => {
    const parser = new GraphqlQuerySelectedFieldsParser(objectMaps, fieldMaps);

    const result = parser.parse(
      { id: true, fund: { id: true, name: true } },
      investorLeadObject,
    );

    expect(result.select.fund).toEqual({ id: true, name: true });
    expect(result.relations.fund).toEqual({});
    expect(result.relationFieldsCount).toBe(1);
  });

  it('should not count relations reached through to-one relations only as under a one-to-many relation', () => {
    const parser = new GraphqlQuerySelectedFieldsParser(objectMaps, fieldMaps);

    const result = parser.parse(
      { id: true, owner: { id: true, parentCompany: { id: true } } },
      investorLeadObject,
    );

    expect(result.relationFieldsCount).toBe(2);
    expect(result.relationFieldsCountUnderOneToMany).toBe(0);
  });

  it('should count a one-to-many relation and every relation below it as under a one-to-many relation', () => {
    const parser = new GraphqlQuerySelectedFieldsParser(objectMaps, fieldMaps);

    const result = parser.parse(
      {
        id: true,
        owner: { id: true },
        fund: { id: true, parentCompany: { id: true } },
      },
      investorLeadObject,
    );

    expect(result.relationFieldsCount).toBe(3);
    expect(result.relationFieldsCountUnderOneToMany).toBe(2);
  });
});
