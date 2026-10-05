import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { computeMaxFieldCountPerRecord } from 'src/engine/api/common/common-query-runners/utils/compute-max-field-count-per-record.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
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

const createMockRelationField = ({
  id,
  name,
  relationType,
  relationTargetObjectMetadataId,
}: {
  id: string;
  name: string;
  relationType: RelationType;
  relationTargetObjectMetadataId: string;
}): FlatFieldMetadata =>
  createMockField({
    id,
    name,
    type: FieldMetadataType.RELATION,
    settings: { relationType },
    relationTargetObjectMetadataId,
  } as Partial<FlatFieldMetadata> & {
    id: string;
    name: string;
    type: FieldMetadataType;
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

describe('computeMaxFieldCountPerRecord', () => {
  const companyObject = createMockObject({
    id: 'company-object-id',
    nameSingular: 'company',
    fieldIds: ['company-people-field', 'company-account-owner-field'],
  });
  const personObject = createMockObject({
    id: 'person-object-id',
    nameSingular: 'person',
    fieldIds: ['person-company-field'],
  });
  const workspaceMemberObject = createMockObject({
    id: 'workspace-member-object-id',
    nameSingular: 'workspaceMember',
    fieldIds: [],
  });

  const flatObjectMetadataMaps = buildObjectMaps([
    companyObject,
    personObject,
    workspaceMemberObject,
  ]);
  const flatFieldMetadataMaps = buildFieldMaps([
    createMockRelationField({
      id: 'company-people-field',
      name: 'people',
      relationType: RelationType.ONE_TO_MANY,
      relationTargetObjectMetadataId: 'person-object-id',
    }),
    createMockRelationField({
      id: 'company-account-owner-field',
      name: 'accountOwner',
      relationType: RelationType.MANY_TO_ONE,
      relationTargetObjectMetadataId: 'workspace-member-object-id',
    }),
    createMockRelationField({
      id: 'person-company-field',
      name: 'company',
      relationType: RelationType.MANY_TO_ONE,
      relationTargetObjectMetadataId: 'company-object-id',
    }),
  ]);

  const computeForCompany = (
    select: CommonSelectedFields,
    recordLimitPerOneToManyRelation = 60,
  ) =>
    computeMaxFieldCountPerRecord({
      select,
      flatObjectMetadata: companyObject,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      recordLimitPerOneToManyRelation,
    });

  it('should count each selected field of the record', () => {
    expect(computeForCompany({ id: true, name: true, domainName: true })).toBe(
      3,
    );
  });

  it('should count a record with no selected field as one field', () => {
    expect(computeForCompany({})).toBe(1);
  });

  it('should add the fields of a to-one relation once', () => {
    expect(
      computeForCompany({ id: true, accountOwner: { id: true, name: true } }),
    ).toBe(3);
  });

  it('should multiply the fields of a one-to-many relation by its limit', () => {
    expect(computeForCompany({ id: true, people: { id: true } })).toBe(61);
  });

  it('should multiply fields nested under a one-to-many relation by its limit', () => {
    expect(
      computeForCompany({
        id: true,
        people: { id: true, company: { id: true, name: true } },
      }),
    ).toBe(181);
  });

  it('should use the given one-to-many limit', () => {
    expect(computeForCompany({ id: true, people: { id: true } }, 5)).toBe(6);
  });

  it('should ignore a nested selection that is not a relation field of the object', () => {
    expect(computeForCompany({ id: true, unknownRelation: { id: true } })).toBe(
      1,
    );
  });
});
