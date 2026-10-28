import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { renderHook } from '@testing-library/react';

import { useCanReadObjectRecordsOrSharedRecords } from '@/object-record/record-sharing/hooks/useCanReadObjectRecordsOrSharedRecords';

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
  objectMetadataItem: Partial<
    Pick<EnrichedObjectMetadataItem, 'isSystem'>
  > = {},
) =>
  renderHook(() =>
    useCanReadObjectRecordsOrSharedRecords({
      id: 'object-id',
      isSystem: false,
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

  it('allows reading shared records when the object can be shared', () => {
    expect(renderCanRead()).toBe(true);
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

  it('denies when record sharing is disabled', () => {
    mockIsRecordLevelSharingEnabled.mockReturnValue(false);

    expect(renderCanRead()).toBe(false);
  });
});
