import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { describeDuplicateEntry } from 'src/engine/api/common/common-query-runners/utils/describe-duplicate-entry.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const OBJECT_METADATA_ID = 'person-object-id';

const buildFlatEntityMaps = <TFlatEntity extends SyncableFlatEntity>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.id,
      flatEntity.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const personFlatObjectMetadata = getFlatObjectMetadataMock({
  id: OBJECT_METADATA_ID,
  universalIdentifier: OBJECT_METADATA_ID,
  nameSingular: 'person',
  namePlural: 'people',
  labelSingular: 'Person',
  labelPlural: 'People',
});

const emailsFlatFieldMetadata = getFlatFieldMetadataMock({
  id: 'emails-field-id',
  universalIdentifier: 'emails-field-id',
  objectMetadataId: OBJECT_METADATA_ID,
  type: FieldMetadataType.EMAILS,
  name: 'emails',
  label: 'Emails',
});

const companyFlatFieldMetadata = getFlatFieldMetadataMock({
  id: 'company-field-id',
  universalIdentifier: 'company-field-id',
  objectMetadataId: OBJECT_METADATA_ID,
  type: FieldMetadataType.RELATION,
  name: 'company',
  label: 'Company',
  settings: { relationType: RelationType.MANY_TO_ONE },
});

const buildFlatIndexMetadata = ({
  name,
  fieldMetadataIds,
}: {
  name: string;
  fieldMetadataIds: string[];
}): FlatIndexMetadata =>
  getFlatIndexMetadataMock({
    id: name,
    universalIdentifier: name,
    name,
    objectMetadataId: OBJECT_METADATA_ID,
    objectMetadataUniversalIdentifier: OBJECT_METADATA_ID,
    applicationUniversalIdentifier: 'application-id',
    isUnique: true,
    flatIndexFieldMetadatas: fieldMetadataIds.map((fieldMetadataId, order) => ({
      id: `${name}-${order}`,
      universalIdentifier: `${name}-${order}`,
      workspaceId: 'workspace-id',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      indexMetadataId: name,
      fieldMetadataId,
      subFieldName: null,
      order,
    })),
  });

const describe_ = (
  duplicateEntryCause: { constraint: string; detail?: string } | undefined,
) => {
  const duplicateEntryDescription = describeDuplicateEntry({
    duplicateEntryCause,
    flatIndexMaps: buildFlatEntityMaps([
      buildFlatIndexMetadata({
        name: 'IDX_UNIQUE_emails',
        fieldMetadataIds: [emailsFlatFieldMetadata.id],
      }),
      buildFlatIndexMetadata({
        name: 'IDX_UNIQUE_company',
        fieldMetadataIds: [companyFlatFieldMetadata.id],
      }),
      buildFlatIndexMetadata({
        name: 'IDX_UNIQUE_company_emails',
        fieldMetadataIds: [
          companyFlatFieldMetadata.id,
          emailsFlatFieldMetadata.id,
        ],
      }),
    ]),
    flatObjectMetadataMaps: buildFlatEntityMaps([personFlatObjectMetadata]),
    flatFieldMetadataMaps: buildFlatEntityMaps([
      emailsFlatFieldMetadata,
      companyFlatFieldMetadata,
    ]),
  });

  return isDefined(duplicateEntryDescription)
    ? {
        objectNameSingular:
          duplicateEntryDescription.flatObjectMetadata.nameSingular,
        fieldNames: duplicateEntryDescription.flatFieldMetadatas.map(
          (flatFieldMetadata) => flatFieldMetadata.name,
        ),
        duplicateColumn: duplicateEntryDescription.duplicateColumn,
      }
    : undefined;
};

describe('describeDuplicateEntry', () => {
  it('lists every field of a multi-field index without the raw key', () => {
    expect(
      describe_({
        constraint: 'IDX_UNIQUE_company_emails',
        detail:
          'Key ("companyId", "emailsPrimaryEmail")=(20202020-0000-0000-0000-000000000000, tim@apple.dev) already exists.',
      }),
    ).toEqual({
      objectNameSingular: 'person',
      fieldNames: ['company', 'emails'],
      duplicateColumn: undefined,
    });
  });

  it('does not expose the raw key of a relation', () => {
    expect(
      describe_({
        constraint: 'IDX_UNIQUE_company',
        detail:
          'Key ("companyId")=(20202020-0000-0000-0000-000000000000) already exists.',
      }),
    ).toEqual({
      objectNameSingular: 'person',
      fieldNames: ['company'],
      duplicateColumn: undefined,
    });
  });

  it('names the field alone when the database gives no detail', () => {
    expect(describe_({ constraint: 'IDX_UNIQUE_emails' })).toEqual({
      objectNameSingular: 'person',
      fieldNames: ['emails'],
      duplicateColumn: undefined,
    });
  });

  it('returns nothing when the violated constraint is not a known index', () => {
    expect(describe_({ constraint: 'IDX_UNKNOWN' })).toBeUndefined();
    expect(describe_(undefined)).toBeUndefined();
  });
});
