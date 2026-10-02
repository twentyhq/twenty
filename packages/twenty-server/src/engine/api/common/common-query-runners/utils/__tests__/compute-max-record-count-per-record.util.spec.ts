import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { computeMaxRecordCountPerRecord } from 'src/engine/api/common/common-query-runners/utils/compute-max-record-count-per-record.util';
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

describe('computeMaxRecordCountPerRecord', () => {
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
    relations: CommonSelectedFields,
    recordLimitPerOneToManyRelation = 60,
  ) =>
    computeMaxRecordCountPerRecord({
      relations,
      flatObjectMetadata: companyObject,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      recordLimitPerOneToManyRelation,
    });

  it('should count only the record itself when no relation is selected', () => {
    expect(computeForCompany({})).toBe(1);
  });

  it('should add one record for a to-one relation', () => {
    expect(computeForCompany({ accountOwner: {} })).toBe(2);
  });

  it('should add the one-to-many limit for a one-to-many relation', () => {
    expect(computeForCompany({ people: {} })).toBe(61);
  });

  it('should multiply relations nested under a one-to-many relation by its limit', () => {
    expect(computeForCompany({ people: { company: {} } })).toBe(121);
  });

  it('should combine sibling and nested relations', () => {
    expect(
      computeForCompany({
        accountOwner: {},
        people: { company: { accountOwner: {} } },
      }),
    ).toBe(182);
  });

  it('should use the given one-to-many limit', () => {
    expect(computeForCompany({ people: {} }, 5)).toBe(6);
  });

  it('should ignore a selected name that is not a relation field of the object', () => {
    expect(computeForCompany({ unknownRelation: {} })).toBe(1);
  });
});
