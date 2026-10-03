import { renderHook } from '@testing-library/react';

import { useCanReadObjectRecordsOrSharedRecords } from '@/object-record/record-sharing/hooks/useCanReadObjectRecordsOrSharedRecords';
import {
  FeatureFlagKey,
  MetadataReadability,
  ObjectSharingReach,
} from '~/generated-metadata/graphql';

const mockIsRecordLevelSharingEnabled = jest.fn();
const mockWorkspaceFeatureFlags = jest.fn();
const mockCanReadObjectRecords = jest.fn();

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsRecordLevelSharingEnabled(),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ featureFlags: mockWorkspaceFeatureFlags() }),
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
    mockWorkspaceFeatureFlags.mockReturnValue([]);
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

  it('keeps shared records readable when the workspace has no visibility gating flag', () => {
    expect(renderCanRead()).toBe(true);
  });

  it('keeps shared records readable when visibility gating is explicitly on', () => {
    mockWorkspaceFeatureFlags.mockReturnValue([
      {
        key: FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED,
        value: true,
      },
    ]);

    expect(renderCanRead()).toBe(true);
  });

  it('denies shared records when visibility gating is explicitly off', () => {
    mockWorkspaceFeatureFlags.mockReturnValue([
      {
        key: FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED,
        value: false,
      },
    ]);

    expect(renderCanRead()).toBe(false);
  });

  it('still allows reading through the role when visibility gating is explicitly off', () => {
    mockWorkspaceFeatureFlags.mockReturnValue([
      {
        key: FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED,
        value: false,
      },
    ]);
    mockCanReadObjectRecords.mockReturnValue(true);

    expect(renderCanRead()).toBe(true);
  });
});
