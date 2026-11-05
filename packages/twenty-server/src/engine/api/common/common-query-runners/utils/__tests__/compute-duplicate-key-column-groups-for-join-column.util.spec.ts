import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { computeDuplicateKeyColumnGroupsForJoinColumn } from 'src/engine/api/common/common-query-runners/utils/compute-duplicate-key-column-groups-for-join-column.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const OBJECT_METADATA_ID = 'messageThreadTargetObjectId';

const buildField = ({
  id,
  name,
  type,
}: {
  id: string;
  name: string;
  type: FieldMetadataType;
}): OrmFlatFieldMetadata =>
  getFlatFieldMetadataMock({
    id,
    universalIdentifier: id,
    objectMetadataId: OBJECT_METADATA_ID,
    name,
    type,
    settings:
      type === FieldMetadataType.RELATION
        ? { relationType: RelationType.MANY_TO_ONE }
        : undefined,
  });

const buildIndex = ({
  id,
  isUnique,
  fieldMetadataIds,
}: {
  id: string;
  isUnique: boolean;
  fieldMetadataIds: string[];
}): FlatIndexMetadata =>
  getFlatIndexMetadataMock({
    id,
    universalIdentifier: id,
    name: id,
    objectMetadataId: OBJECT_METADATA_ID,
    objectMetadataUniversalIdentifier: OBJECT_METADATA_ID,
    applicationUniversalIdentifier: 'application-id',
    isUnique,
    flatIndexFieldMetadatas: fieldMetadataIds.map((fieldMetadataId, order) => ({
      id: `${id}-field-${order}`,
      workspaceId: 'workspace-id',
      indexMetadataId: id,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      fieldMetadataId,
      subFieldName: null,
      order,
    })),
  });

const buildFieldMetadataMaps = (
  fieldMetadatas: OrmFlatFieldMetadata[],
): FlatEntityMaps<OrmFlatFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    fieldMetadatas.map((fieldMetadata) => [fieldMetadata.id, fieldMetadata]),
  ),
  universalIdentifierById: Object.fromEntries(
    fieldMetadatas.map((fieldMetadata) => [fieldMetadata.id, fieldMetadata.id]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildIndexMaps = (
  indexMetadatas: FlatIndexMetadata[],
): FlatEntityMaps<FlatIndexMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    indexMetadatas.map((indexMetadata) => [indexMetadata.id, indexMetadata]),
  ),
  universalIdentifierById: Object.fromEntries(
    indexMetadatas.map((indexMetadata) => [indexMetadata.id, indexMetadata.id]),
  ),
  universalIdentifiersByApplicationId: {},
});

const idField = buildField({
  id: 'idFieldId',
  name: 'id',
  type: FieldMetadataType.UUID,
});
const messageThreadField = buildField({
  id: 'messageThreadFieldId',
  name: 'messageThread',
  type: FieldMetadataType.RELATION,
});
const targetPersonField = buildField({
  id: 'targetPersonFieldId',
  name: 'targetPerson',
  type: FieldMetadataType.RELATION,
});

const fields = [idField, messageThreadField, targetPersonField];

const buildFlatObjectMetadata = (
  indexMetadataIds: string[],
): FlatObjectMetadata =>
  getFlatObjectMetadataMock({
    id: OBJECT_METADATA_ID,
    universalIdentifier: OBJECT_METADATA_ID,
    nameSingular: 'messageThreadTarget',
    fieldIds: fields.map((field) => field.id),
    indexMetadataIds,
  });

const computeGroups = ({
  indexes,
  joinColumnName,
}: {
  indexes: FlatIndexMetadata[];
  joinColumnName: string;
}) =>
  computeDuplicateKeyColumnGroupsForJoinColumn({
    flatObjectMetadata: buildFlatObjectMetadata(
      indexes.map((index) => index.id),
    ),
    flatFieldMetadataMaps: buildFieldMetadataMaps(fields),
    flatIndexMaps: buildIndexMaps(indexes),
    joinColumnName,
  });

describe('computeDuplicateKeyColumnGroupsForJoinColumn', () => {
  const compositeUniqueIndex = buildIndex({
    id: 'messageThreadTargetPersonUniqueIndex',
    isUnique: true,
    fieldMetadataIds: [messageThreadField.id, targetPersonField.id],
  });

  it('should return the sibling columns of a unique index covering the join column', () => {
    expect(
      computeGroups({
        indexes: [compositeUniqueIndex],
        joinColumnName: 'targetPersonId',
      }),
    ).toEqual([['messageThreadId']]);
  });

  it('should return nothing for a join column no unique index covers', () => {
    expect(
      computeGroups({
        indexes: [compositeUniqueIndex],
        joinColumnName: 'targetCompanyId',
      }),
    ).toEqual([]);
  });

  it('should ignore indexes that are not unique', () => {
    expect(
      computeGroups({
        indexes: [
          buildIndex({
            id: 'messageThreadIdIndex',
            isUnique: false,
            fieldMetadataIds: [messageThreadField.id, targetPersonField.id],
          }),
        ],
        joinColumnName: 'targetPersonId',
      }),
    ).toEqual([]);
  });

  it('should return an empty group when the join column alone must stay unique', () => {
    expect(
      computeGroups({
        indexes: [
          buildIndex({
            id: 'targetPersonUniqueIndex',
            isUnique: true,
            fieldMetadataIds: [targetPersonField.id],
          }),
        ],
        joinColumnName: 'targetPersonId',
      }),
    ).toEqual([[]]);
  });
});
