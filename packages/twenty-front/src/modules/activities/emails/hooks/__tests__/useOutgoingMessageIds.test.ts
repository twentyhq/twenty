import { renderHook } from '@testing-library/react';

import { useOutgoingMessageIds } from '@/activities/emails/hooks/useOutgoingMessageIds';

const mockUseFindManyRecords = jest.fn();

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: () => mockUseFindManyRecords(),
}));

describe('useOutgoingMessageIds', () => {
  it('returns null while the first query is loading', () => {
    mockUseFindManyRecords.mockReturnValue({
      records: [],
      totalCount: undefined,
      loading: true,
    });

    const { result } = renderHook(() => useOutgoingMessageIds(['message-1']));

    expect(result.current).toBeNull();
  });

  it('returns the outgoing message ids once loaded', () => {
    mockUseFindManyRecords.mockReturnValue({
      records: [{ id: 'association-1', messageId: 'message-1' }],
      totalCount: 1,
      loading: false,
    });

    const { result } = renderHook(() => useOutgoingMessageIds(['message-1']));

    expect(result.current).toEqual(new Set(['message-1']));
  });

  it('treats a query that settles without a result as no outgoing message', () => {
    mockUseFindManyRecords.mockReturnValue({
      records: [],
      totalCount: undefined,
      loading: false,
    });

    const { result } = renderHook(() => useOutgoingMessageIds(['message-1']));

    expect(result.current).toEqual(new Set());
  });
});
