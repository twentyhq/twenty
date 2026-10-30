/* @license Enterprise */

import { FeatureFlagKey, MetadataReadability } from 'twenty-shared/types';

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { resolveObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';

const OBJECT = {
  readability: MetadataReadability.OPEN,
  isSystem: false,
  disabledObjectPermissionActions: null,
};
const RECORD_SHARING = {
  [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
};

describe('resolveObjectSharing', () => {
  it('should open records by default and let grants view or edit beyond the role', () => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: OBJECT,
        featureFlagsMap: RECORD_SHARING,
      }),
    ).toEqual({
      sharingMode: RecordSharingMode.OPEN_BY_DEFAULT,
      canShareBeyondRole: true,
      operationTypesGrantedBeyondRole: ['select', 'update'],
    });
  });

  it.each([
    { isSystem: false, featureFlagsMap: {} },
    { isSystem: true, featureFlagsMap: RECORD_SHARING },
  ])(
    'should keep records role-only for %o',
    ({ isSystem, featureFlagsMap }) => {
      expect(
        resolveObjectSharing({
          flatObjectMetadata: { ...OBJECT, isSystem },
          featureFlagsMap,
        }),
      ).toEqual({
        sharingMode: RecordSharingMode.ROLE_ONLY,
        canShareBeyondRole: false,
        operationTypesGrantedBeyondRole: [],
      });
    },
  );

  it('should not grant beyond the role an operation the object disables', () => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: {
          ...OBJECT,
          disabledObjectPermissionActions: ['canUpdateObjectRecords'],
        },
        featureFlagsMap: RECORD_SHARING,
      }).operationTypesGrantedBeyondRole,
    ).toEqual(['select']);
  });

  it('should not share beyond the role when the object disables every operation a share could grant', () => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: {
          ...OBJECT,
          disabledObjectPermissionActions: [
            'canReadObjectRecords',
            'canUpdateObjectRecords',
          ],
        },
        featureFlagsMap: RECORD_SHARING,
      }),
    ).toMatchObject({
      canShareBeyondRole: false,
      operationTypesGrantedBeyondRole: [],
    });
  });

  it.each([
    { isSystem: false, featureFlagsMap: {} },
    { isSystem: true, featureFlagsMap: RECORD_SHARING },
  ])(
    'should keep private records private for %o',
    ({ isSystem, featureFlagsMap }) => {
      expect(
        resolveObjectSharing({
          flatObjectMetadata: {
            ...OBJECT,
            readability: MetadataReadability.PRIVATE,
            isSystem,
          },
          featureFlagsMap,
        }),
      ).toEqual({
        sharingMode: RecordSharingMode.PRIVATE,
        canShareBeyondRole: false,
        operationTypesGrantedBeyondRole: [],
      });
    },
  );

  it('should let a grant on a private object view or edit beyond the role', () => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: {
          ...OBJECT,
          readability: MetadataReadability.PRIVATE,
        },
        featureFlagsMap: RECORD_SHARING,
      }),
    ).toEqual({
      sharingMode: RecordSharingMode.PRIVATE,
      canShareBeyondRole: true,
      operationTypesGrantedBeyondRole: ['select', 'update'],
    });
  });
});
