import { computeUnrestrictableFieldPermissionChanges } from 'src/database/commands/upgrade-version-command/2-40/utils/compute-unrestrictable-field-permission-changes.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FlatFieldPermissionMaps } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const CUSTOM_APPLICATION_ID = '20202020-0000-0000-0000-000000000001';
const OTHER_APPLICATION_ID = '20202020-0000-0000-0000-000000000002';
const OBJECT_METADATA_ID = '20202020-0000-0000-0000-000000000003';
const NAME_FIELD_ID = '20202020-0000-0000-0000-000000000004';
const CREATED_AT_FIELD_ID = '20202020-0000-0000-0000-000000000005';
const EMAILS_FIELD_ID = '20202020-0000-0000-0000-000000000006';

const buildFlatFieldMetadataMaps = (): FlatEntityMaps<FlatFieldMetadata> =>
  ({
    byUniversalIdentifier: {
      name: { id: NAME_FIELD_ID, name: 'name', isUIEditable: true },
      createdAt: {
        id: CREATED_AT_FIELD_ID,
        name: 'createdAt',
        isUIEditable: false,
      },
      emails: { id: EMAILS_FIELD_ID, name: 'emails', isUIEditable: true },
    },
    universalIdentifierById: {
      [NAME_FIELD_ID]: 'name',
      [CREATED_AT_FIELD_ID]: 'createdAt',
      [EMAILS_FIELD_ID]: 'emails',
    },
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatEntityMaps<FlatFieldMetadata>;

const buildFlatObjectMetadataMaps = (): FlatEntityMaps<FlatObjectMetadata> =>
  ({
    byUniversalIdentifier: {
      person: {
        id: OBJECT_METADATA_ID,
        labelIdentifierFieldMetadataId: NAME_FIELD_ID,
      },
    },
    universalIdentifierById: { [OBJECT_METADATA_ID]: 'person' },
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatEntityMaps<FlatObjectMetadata>;

const buildFlatFieldPermissionMaps = (
  flatFieldPermissions: Partial<FlatFieldPermission>[],
): FlatFieldPermissionMaps =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatFieldPermissions.map((flatFieldPermission) => [
        flatFieldPermission.id,
        {
          applicationId: CUSTOM_APPLICATION_ID,
          objectMetadataId: OBJECT_METADATA_ID,
          canReadFieldValue: null,
          canUpdateFieldValue: null,
          ...flatFieldPermission,
        },
      ]),
    ),
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatFieldPermissionMaps;

const computeChanges = (
  flatFieldPermissions: Partial<FlatFieldPermission>[],
) =>
  computeUnrestrictableFieldPermissionChanges({
    applicationId: CUSTOM_APPLICATION_ID,
    flatFieldPermissionMaps: buildFlatFieldPermissionMaps(flatFieldPermissions),
    flatFieldMetadataMaps: buildFlatFieldMetadataMaps(),
    flatObjectMetadataMaps: buildFlatObjectMetadataMaps(),
  });

describe('computeUnrestrictableFieldPermissionChanges', () => {
  it('deletes restrictions on a non-editable system field', () => {
    const changes = computeChanges([
      {
        id: 'permission-1',
        fieldMetadataId: CREATED_AT_FIELD_ID,
        canReadFieldValue: false,
        canUpdateFieldValue: false,
      },
    ]);

    expect(changes.fieldPermissionIdsToDelete).toEqual(['permission-1']);
    expect(changes.fieldPermissionIdsToClearReadOn).toEqual([]);
  });

  it('leaves restrictions on a regular field alone', () => {
    const changes = computeChanges([
      {
        id: 'permission-1',
        fieldMetadataId: EMAILS_FIELD_ID,
        canReadFieldValue: false,
        canUpdateFieldValue: false,
      },
    ]);

    expect(changes.fieldPermissionIdsToDelete).toEqual([]);
    expect(changes.fieldPermissionIdsToClearReadOn).toEqual([]);
  });

  it('clears read on a label identifier that keeps an update restriction', () => {
    const changes = computeChanges([
      {
        id: 'permission-1',
        fieldMetadataId: NAME_FIELD_ID,
        canReadFieldValue: false,
        canUpdateFieldValue: false,
      },
    ]);

    expect(changes.fieldPermissionIdsToDelete).toEqual([]);
    expect(changes.fieldPermissionIdsToClearReadOn).toEqual(['permission-1']);
  });

  it('deletes a label identifier restriction that only revoked read', () => {
    const changes = computeChanges([
      {
        id: 'permission-1',
        fieldMetadataId: NAME_FIELD_ID,
        canReadFieldValue: false,
        canUpdateFieldValue: null,
      },
    ]);

    expect(changes.fieldPermissionIdsToDelete).toEqual(['permission-1']);
    expect(changes.fieldPermissionIdsToClearReadOn).toEqual([]);
  });

  it('leaves an update-only restriction on the label identifier alone', () => {
    const changes = computeChanges([
      {
        id: 'permission-1',
        fieldMetadataId: NAME_FIELD_ID,
        canReadFieldValue: null,
        canUpdateFieldValue: false,
      },
    ]);

    expect(changes.fieldPermissionIdsToDelete).toEqual([]);
    expect(changes.fieldPermissionIdsToClearReadOn).toEqual([]);
  });

  it('leaves permissions owned by another application alone', () => {
    const changes = computeChanges([
      {
        id: 'permission-1',
        applicationId: OTHER_APPLICATION_ID,
        fieldMetadataId: CREATED_AT_FIELD_ID,
        canReadFieldValue: false,
        canUpdateFieldValue: false,
      },
    ]);

    expect(changes.fieldPermissionIdsToDelete).toEqual([]);
    expect(changes.fieldPermissionIdsToClearReadOn).toEqual([]);
  });
});
