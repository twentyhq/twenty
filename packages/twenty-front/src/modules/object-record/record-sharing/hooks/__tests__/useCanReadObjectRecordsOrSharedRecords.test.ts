import { renderHook } from '@testing-library/react';

import { useCanReadObjectRecordsOrSharedRecords } from '@/object-record/record-sharing/hooks/useCanReadObjectRecordsOrSharedRecords';
import { ObjectSharingReach } from '~/generated-metadata/graphql';

const mockIsRecordLevelSharingEnabled = jest.fn();
const mockCanReadObjectRecords = jest.fn();

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsRecordLevelSharingEnabled(),
}));
jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({
    canReadObjectRecords: mockCanReadObjectRecords(),
  }),
}));

const renderCanRead = (
  objectMetadataItem: Partial<{
    isSystem: boolean;
    sharingReach: ObjectSharingReach;
  }> = {},
) =>
  renderHook(() =>
    useCanReadObjectRecordsOrSharedRecords({
      id: 'object-id',
      isSystem: false,
      sharingReach: ObjectSharingReach.WORKSPACE,
      ...objectMetadataItem,
    }),
  ).result.current;

describe('useCanReadObjectRecordsOrSharedRecords', () => {
  beforeEach(() => {
    mockIsRecordLevelSharingEnabled.mockReturnValue(true);
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

  it('denies on system objects', () => {
    expect(renderCanRead({ isSystem: true })).toBe(false);
  });

  it('denies when record sharing is disabled', () => {
    mockIsRecordLevelSharingEnabled.mockReturnValue(false);

    expect(renderCanRead()).toBe(false);
  });
});
