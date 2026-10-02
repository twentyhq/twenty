import { type ObjectPermissions } from 'twenty-shared/types';

import { buildNavigateToRecordOutput } from 'src/engine/core-modules/tool/tools/navigate-tool/utils/build-navigate-to-record-output.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const RECORD_ID = '20202020-0000-4000-8000-000000000001';

const COMPANY_OBJECT = getFlatObjectMetadataMock({
  universalIdentifier: 'company-universal-identifier',
  id: 'company-object-id',
  nameSingular: 'company',
});

const ARCHIVED_OBJECT = getFlatObjectMetadataMock({
  universalIdentifier: 'archived-universal-identifier',
  id: 'archived-object-id',
  nameSingular: 'archived',
  isActive: false,
});

const EMPTY_FLAT_OBJECT_METADATA_MAPS: FlatEntityMaps<FlatObjectMetadata> =
  createEmptyFlatEntityMaps();

const FLAT_OBJECT_METADATA_MAPS = [COMPANY_OBJECT, ARCHIVED_OBJECT].reduce(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  EMPTY_FLAT_OBJECT_METADATA_MAPS,
);

const buildObjectPermissions = (
  canReadObjectRecords: boolean,
): ObjectPermissions => ({
  canReadObjectRecords,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
});

const NOT_FOUND_ERROR = `No company record with id "${RECORD_ID}" was found, or you do not have access to it.`;

describe('buildNavigateToRecordOutput', () => {
  it('should return the record route when the caller can read the object', () => {
    const output = buildNavigateToRecordOutput({
      objectNameSingular: 'company',
      recordId: RECORD_ID,
      flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
      objectsPermissions: {
        [COMPANY_OBJECT.id]: buildObjectPermissions(true),
      },
    });

    expect(output).toMatchObject({
      success: true,
      result: {
        action: 'navigateToRecord',
        objectNameSingular: 'company',
        recordId: RECORD_ID,
      },
    });
  });

  it('should return not found when the caller cannot read the object', () => {
    const output = buildNavigateToRecordOutput({
      objectNameSingular: 'company',
      recordId: RECORD_ID,
      flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
      objectsPermissions: {
        [COMPANY_OBJECT.id]: buildObjectPermissions(false),
      },
    });

    expect(output.success).toBe(false);
    expect(output.result).toBeUndefined();
    expect(output.error).toBe(NOT_FOUND_ERROR);
  });

  it('should return not found when the caller has no permissions on the object', () => {
    const output = buildNavigateToRecordOutput({
      objectNameSingular: 'company',
      recordId: RECORD_ID,
      flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
      objectsPermissions: {},
    });

    expect(output.success).toBe(false);
    expect(output.error).toBe(NOT_FOUND_ERROR);
  });

  it.each(['unknown', 'archived'])(
    'should return not found for an %s object',
    (objectNameSingular) => {
      const output = buildNavigateToRecordOutput({
        objectNameSingular,
        recordId: RECORD_ID,
        flatObjectMetadataMaps: FLAT_OBJECT_METADATA_MAPS,
        objectsPermissions: {
          [ARCHIVED_OBJECT.id]: buildObjectPermissions(true),
        },
      });

      expect(output.success).toBe(false);
      expect(output.result).toBeUndefined();
    },
  );
});
