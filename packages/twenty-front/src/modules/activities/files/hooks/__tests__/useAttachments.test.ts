import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

vi.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: vi.fn(),
}));

describe('useAttachments', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches attachments correctly for a given targetableObject', () => {
    const mockAttachments = [
      { id: '1', name: 'Attachment 1', __typename: 'Attachment' },
      { id: '2', name: 'Attachment 2', __typename: 'Attachment' },
    ];
    const mockTargetableObject = {
      id: '1',
      targetObjectNameSingular: 'SomeObject',
    };

    vi.mocked(useFindManyRecords).mockReturnValue({
      objectMetadataItem: {
        id: '1',
        nameSingular: 'attachment',
        namePlural: 'attachments',
        labelSingular: 'Attachment',
        labelPlural: 'Attachments',
        description: null,
        icon: null,
        createdAt: '',
        updatedAt: '',
        isActive: true,
        isCustom: false,
        isSystem: false,
        isRemote: false,
        isSearchable: true,
        isUIReadOnly: false,
        isLabelSyncedWithName: false,
        applicationId: '',
        shortcut: null,
        duplicateCriteria: null,
        standardOverrides: null,
        labelIdentifierFieldMetadataId: '',
        imageIdentifierFieldMetadataId: null,
        fields: [],
        readableFields: [],
        updatableFields: [],
        indexMetadatas: [],
      },
      records: mockAttachments,
      totalCount: 2,
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

    const { result } = renderHook(() => useAttachments(mockTargetableObject));

    expect(result.current.attachments).toEqual(mockAttachments);
  });

  it('handles case when there are no attachments', () => {
    const mockTargetableObject = {
      id: '1',
      targetObjectNameSingular: 'SomeObject',
    };

    vi.mocked(useFindManyRecords).mockReturnValue({
      objectMetadataItem: {
        id: '1',
        nameSingular: 'attachment',
        namePlural: 'attachments',
        labelSingular: 'Attachment',
        labelPlural: 'Attachments',
        description: null,
        icon: null,
        createdAt: '',
        updatedAt: '',
        isActive: true,
        isCustom: false,
        isSystem: false,
        isRemote: false,
        isSearchable: true,
        isUIReadOnly: false,
        isLabelSyncedWithName: false,
        applicationId: '',
        shortcut: null,
        duplicateCriteria: null,
        standardOverrides: null,
        labelIdentifierFieldMetadataId: '',
        imageIdentifierFieldMetadataId: null,
        fields: [],
        readableFields: [],
        updatableFields: [],
        indexMetadatas: [],
      },
      records: [],
      totalCount: 0,
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

    const { result } = renderHook(() => useAttachments(mockTargetableObject));

    expect(result.current.attachments).toEqual([]);
  });
});
