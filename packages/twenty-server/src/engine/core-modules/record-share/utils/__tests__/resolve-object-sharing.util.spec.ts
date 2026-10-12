/* @license Enterprise */

import {
  FeatureFlagKey,
  MetadataReadability,
  ObjectSharingReach,
} from 'twenty-shared/types';

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { resolveObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';

const OPEN_OBJECT = {
  readability: MetadataReadability.OPEN,
  isSystem: false,
  sharingReach: ObjectSharingReach.WORKSPACE,
};
const RECORD_SHARING = {
  [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
};

describe('resolveObjectSharing', () => {
  it.each([
    [MetadataReadability.PRIVATE, false, false, RecordSharingMode.PRIVATE],
    [MetadataReadability.PRIVATE, true, false, RecordSharingMode.PRIVATE],
    [MetadataReadability.INHERITED, false, false, RecordSharingMode.INHERITED],
    [MetadataReadability.OPEN, false, true, RecordSharingMode.OPEN_BY_DEFAULT],
    [MetadataReadability.OPEN, false, false, RecordSharingMode.ROLE_ONLY],
    [MetadataReadability.OPEN, true, true, RecordSharingMode.ROLE_ONLY],
    [MetadataReadability.SYSTEM, false, true, RecordSharingMode.ROLE_ONLY],
    [MetadataReadability.APPLICATION, false, true, RecordSharingMode.ROLE_ONLY],
  ])(
    'should resolve a %s object (system: %s) with record sharing %s to %s',
    (readability, isSystem, isRecordSharingEnabled, sharingMode) => {
      expect(
        resolveObjectSharing({
          flatObjectMetadata: { ...OPEN_OBJECT, readability, isSystem },
          featureFlagsMap: isRecordSharingEnabled ? RECORD_SHARING : {},
        }).sharingMode,
      ).toBe(sharingMode);
    },
  );

  it('should keep visibility gating on for a workspace without flag rows', () => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: OPEN_OBJECT,
        featureFlagsMap: {},
      }),
    ).toEqual({
      sharingMode: RecordSharingMode.ROLE_ONLY,
      isVisibilityGatingEnabled: true,
      canShareBeyondRole: false,
      operationTypesGrantedBeyondRole: [],
    });
  });

  it.each([
    MetadataReadability.OPEN,
    MetadataReadability.PRIVATE,
    MetadataReadability.INHERITED,
  ])(
    'should let a grant on a %s object view or edit beyond the role',
    (readability) => {
      expect(
        resolveObjectSharing({
          flatObjectMetadata: { ...OPEN_OBJECT, readability },
          featureFlagsMap: RECORD_SHARING,
        }),
      ).toMatchObject({
        canShareBeyondRole: true,
        operationTypesGrantedBeyondRole: ['select', 'update'],
      });
    },
  );

  it.each([
    { sharingReach: ObjectSharingReach.ROLE_ACCESS },
    { readability: MetadataReadability.SYSTEM },
    { readability: MetadataReadability.APPLICATION },
    { isSystem: true },
    { readability: MetadataReadability.PRIVATE, isSystem: true },
  ])('should keep grants within the role on %o', (object) => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: { ...OPEN_OBJECT, ...object },
        featureFlagsMap: RECORD_SHARING,
      }),
    ).toMatchObject({
      canShareBeyondRole: false,
      operationTypesGrantedBeyondRole: [],
    });
  });

  it('should keep sharing but grant nothing beyond the role once gating is turned off', () => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: OPEN_OBJECT,
        featureFlagsMap: {
          ...RECORD_SHARING,
          [FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED]: false,
        },
      }),
    ).toEqual({
      sharingMode: RecordSharingMode.OPEN_BY_DEFAULT,
      isVisibilityGatingEnabled: false,
      canShareBeyondRole: true,
      operationTypesGrantedBeyondRole: [],
    });
  });
});
