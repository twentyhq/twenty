import { renderHook } from '@testing-library/react';

import { useCanReadObjectRecordsOrSharedRecords } from '@/object-record/record-sharing/hooks/useCanReadObjectRecordsOrSharedRecords';
import {
  FeatureFlagKey,
  MetadataReadability,
  ObjectSharingReach,
} from '~/generated-metadata/graphql';

const mockIsRecordLevelSharingEnabled = jest.fn();
const mockIsRecordShareVisibilityGatingEnabled = jest.fn();
const mockCanReadObjectRecords = jest.fn();

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: (featureFlagKey: FeatureFlagKey) =>
    featureFlagKey === FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED
      ? mockIsRecordShareVisibilityGatingEnabled()
      : mockIsRecordLevelSharingEnabled(),
}));
jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({
    canReadObjectRecords: mockCanReadObjectRecords(),
  }),
}));

const renderCanRead = (
  objectMetadataItem: Partial<{
    isSystem: boolean;
    readability: MetadataReadability;
    sharingReach: ObjectSharingReach;
  }> = {},
) =>
  renderHook(() =>
    useCanReadObjectRecordsOrSharedRecords({
      id: 'object-id',
      isSystem: false,
      readability: MetadataReadability.OPEN,
      sharingReach: ObjectSharingReach.WORKSPACE,
      ...objectMetadataItem,
    }),
  ).result.current;

describe('useCanReadObjectRecordsOrSharedRecords', () => {
  beforeEach(() => {
    mockIsRecordLevelSharingEnabled.mockReturnValue(true);
    mockIsRecordShareVisibilityGatingEnabled.mockReturnValue(true);
    mockCanReadObjectRecords.mockReturnValue(false);
  });

  it('allows reading when the role can read the object', () => {
    mockIsRecordLevelSharingEnabled.mockReturnValue(false);
    mockCanReadObjectRecords.mockReturnValue(true);

    expect(renderCanRead()).toBe(true);
  });

  it('allows reading shared records when the object can be shared with anyone', () => {
    expect(renderCanRead()).toBe(true);
  });

  it('denies when sharing stays within role access', () => {
    expect(
      renderCanRead({ sharingReach: ObjectSharingReach.ROLE_ACCESS }),
    ).toBe(false);
  });

  it.each([true, false])(
    'denies on system objects with record sharing enabled: %s',
    (isRecordLevelSharingEnabled) => {
      mockIsRecordLevelSharingEnabled.mockReturnValue(
        isRecordLevelSharingEnabled,
      );

      expect(renderCanRead({ isSystem: true })).toBe(false);
    },
  );

  it.each([MetadataReadability.APPLICATION, MetadataReadability.SYSTEM])(
    'denies on %s objects, whose records are never shared',
    (readability) => {
      expect(renderCanRead({ readability })).toBe(false);
    },
  );

  it('denies when record sharing is disabled', () => {
    mockIsRecordLevelSharingEnabled.mockReturnValue(false);

    expect(renderCanRead()).toBe(false);
  });

  it('denies shared records when record share visibility gating is off', () => {
    mockIsRecordShareVisibilityGatingEnabled.mockReturnValue(false);

    expect(renderCanRead()).toBe(false);
  });

  it('still allows reading through the role when record share visibility gating is off', () => {
    mockIsRecordShareVisibilityGatingEnabled.mockReturnValue(false);
    mockCanReadObjectRecords.mockReturnValue(true);

    expect(renderCanRead()).toBe(true);
  });
});
