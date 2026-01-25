import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { type Attachment } from '@/activities/files/types/Attachment';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

vi.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: vi.fn(),
}));
vi.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: vi.fn(),
}));

const mockUseFindManyRecords = (records: Attachment[]) => {
  vi.mocked(useFindManyRecords).mockReturnValue({
    objectMetadataItem: getMockObjectMetadataItemOrThrow('attachment'),
    records,
    totalCount: records.length,
    loading: false,
    error: undefined,
    fetchMoreRecords: vi.fn(),
    queryIdentifier: '',
    hasNextPage: false,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: '',
      endCursor: '',
    },
    refetch: vi.fn(),
  });
};

describe('useAttachments', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches attachments correctly for a given targetableObject', () => {
    const mockAttachments: Attachment[] = [
      {
        id: '1',
        name: 'Attachment 1',
        fullPath: '/attachments/1',
        fileCategory: 'OTHER',
        createdAt: '2024-01-01T00:00:00.000Z',
        __typename: 'Attachment',
      },
      {
        id: '2',
        name: 'Attachment 2',
        fullPath: '/attachments/2',
        fileCategory: 'OTHER',
        createdAt: '2024-01-02T00:00:00.000Z',
        __typename: 'Attachment',
      },
    ];
    const mockTargetableObject = {
      id: '1',
      targetObjectNameSingular: 'SomeObject',
    };

    mockUseFindManyRecords(mockAttachments);
    vi.mocked(useIsFeatureEnabled).mockReturnValue(false);

    const { result } = renderHook(() => useAttachments(mockTargetableObject));

    expect(result.current.attachments).toEqual(mockAttachments);
  });

  it('handles case when there are no attachments', () => {
    const mockTargetableObject = {
      id: '1',
      targetObjectNameSingular: 'SomeObject',
    };

    mockUseFindManyRecords([]);
    vi.mocked(useIsFeatureEnabled).mockReturnValue(false);

    const { result } = renderHook(() => useAttachments(mockTargetableObject));

    expect(result.current.attachments).toEqual([]);
  });
});
