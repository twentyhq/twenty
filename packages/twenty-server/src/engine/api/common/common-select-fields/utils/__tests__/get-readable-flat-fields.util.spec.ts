import { getReadableFlatFields } from 'src/engine/api/common/common-select-fields/utils/get-readable-flat-fields.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';

type TestFlatFieldMetadata = SyncableFlatEntity & { name: string };

const FIELDS: TestFlatFieldMetadata[] = ['id', 'name', 'salary'].map(
  (name) => ({
    id: `${name}-id`,
    universalIdentifier: `${name}-universal-identifier`,
    applicationId: 'application-id',
    workspaceId: 'workspace-id',
    name,
  }),
);

const FLAT_FIELD_METADATA_MAPS = {
  byUniversalIdentifier: Object.fromEntries(
    FIELDS.map((field) => [field.universalIdentifier, field]),
  ),
  universalIdentifierById: Object.fromEntries(
    FIELDS.map((field) => [field.id, field.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
};

describe('getReadableFlatFields', () => {
  it('should return every field of the object in field order when nothing is restricted', () => {
    expect(
      getReadableFlatFields({
        flatObjectMetadata: { fieldIds: ['name-id', 'id-id', 'salary-id'] },
        flatFieldMetadataMaps: FLAT_FIELD_METADATA_MAPS,
        restrictedFields: {},
      }).map((field) => field.name),
    ).toEqual(['name', 'id', 'salary']);
  });

  it('should drop fields the caller cannot read', () => {
    expect(
      getReadableFlatFields({
        flatObjectMetadata: { fieldIds: ['id-id', 'name-id', 'salary-id'] },
        flatFieldMetadataMaps: FLAT_FIELD_METADATA_MAPS,
        restrictedFields: {
          'salary-id': { canRead: false },
          'name-id': { canRead: true, canUpdate: false },
        },
      }).map((field) => field.name),
    ).toEqual(['id', 'name']);
  });
});
