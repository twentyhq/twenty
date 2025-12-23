import { renderHook } from '@testing-library/react';

import { useAttachments } from '@/activities/files/hooks/useAttachments';

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));

describe('useAttachments', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches attachments correctly for a given targetableObject', () => {
    const mockAttachments = [
      { id: '1', name: 'Attachment 1' },
      { id: 2, name: 'Attachment 2' },
    ];
    const mockTargetableObject = {
      id: '1',
      targetObjectNameSingular: 'SomeObject',
    };

    const useFindManyRecordsMock = jest.requireMock(
      '@/object-record/hooks/useFindManyRecords',
    );
    useFindManyRecordsMock.useFindManyRecords.mockReturnValue({
      records: mockAttachments,
    });

    const { result } = renderHook(() => useAttachments(mockTargetableObject));

    expect(result.current.attachments).toEqual(mockAttachments);
  });

  it('handles case when there are no attachments', () => {
    const mockTargetableObject = {
      id: '1',
      targetObjectNameSingular: 'SomeObject',
    };

    const useFindManyRecordsMock = jest.requireMock(
      '@/object-record/hooks/useFindManyRecords',
    );
    useFindManyRecordsMock.useFindManyRecords.mockReturnValue({ records: [] });

    const { result } = renderHook(() => useAttachments(mockTargetableObject));

    expect(result.current.attachments).toEqual([]);
  });
});
