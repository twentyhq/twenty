import { act, renderHook } from '@testing-library/react';
import { gql } from '@apollo/client';

import { useToggleActivityLink } from '@/activities/hooks/useToggleActivityLink';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const mockCreateOneRecord = jest.fn();
const mockDeleteOneRecord = jest.fn();
const mockRefetch = jest.fn();
const mockRefetchQueries = jest.fn();
const mockUseFindManyRecords = jest.fn();

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (args: unknown) => mockUseFindManyRecords(args),
}));

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({ createOneRecord: mockCreateOneRecord }),
}));

jest.mock('@/object-record/hooks/useDeleteOneRecord', () => ({
  useDeleteOneRecord: () => ({ deleteOneRecord: mockDeleteOneRecord }),
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ refetchQueries: mockRefetchQueries }),
}));

const TIMELINE_QUERY = gql`
  query Timeline {
    timeline
  }
`;

const targetRecord = {
  id: 'opportunity-id',
  targetObjectNameSingular: CoreObjectNameSingular.Opportunity,
};

const renderToggleHook = () =>
  renderHook(() =>
    useToggleActivityLink({
      targetRecord,
      activityLinkConfig: {
        junctionObjectNameSingular: CoreObjectNameSingular.MessageThreadTarget,
        activityJoinColumnName: 'messageThreadId',
        targetJoinColumnName: 'targetOpportunityId',
      },
      activityIds: ['linked-thread-id', 'unlinked-thread-id'],
      timelineQuery: TIMELINE_QUERY,
    }),
  );

describe('useToggleActivityLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseFindManyRecords.mockReturnValue({
      records: [{ id: 'target-id', messageThreadId: 'linked-thread-id' }],
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    });
  });

  it('should only look up links between this record and the displayed activities', () => {
    renderToggleHook();

    expect(mockUseFindManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({
        objectNameSingular: CoreObjectNameSingular.MessageThreadTarget,
        filter: {
          targetOpportunityId: { eq: 'opportunity-id' },
          messageThreadId: { in: ['linked-thread-id', 'unlinked-thread-id'] },
        },
      }),
    );
  });

  it('should expose linked activities', () => {
    const { result } = renderToggleHook();

    expect(result.current.linkedActivityIds.has('linked-thread-id')).toBe(true);
    expect(result.current.linkedActivityIds.has('unlinked-thread-id')).toBe(
      false,
    );
  });

  it('should link an unlinked activity to the record and refresh the timeline', async () => {
    const { result } = renderToggleHook();

    await act(() => result.current.toggleActivityLink('unlinked-thread-id'));

    expect(mockCreateOneRecord).toHaveBeenCalledWith({
      messageThreadId: 'unlinked-thread-id',
      targetOpportunityId: 'opportunity-id',
    });
    expect(mockDeleteOneRecord).not.toHaveBeenCalled();
    expect(mockRefetch).toHaveBeenCalled();
    expect(mockRefetchQueries).toHaveBeenCalledWith({
      include: [TIMELINE_QUERY],
    });
  });

  it('should unlink a linked activity from the record', async () => {
    const { result } = renderToggleHook();

    await act(() => result.current.toggleActivityLink('linked-thread-id'));

    expect(mockDeleteOneRecord).toHaveBeenCalledWith('target-id');
    expect(mockCreateOneRecord).not.toHaveBeenCalled();
  });

  it('should wait for links to load before unlinking an existing activity', async () => {
    mockUseFindManyRecords.mockReturnValue({
      records: [],
      loading: true,
      error: undefined,
      refetch: mockRefetch,
    });

    const { result, rerender } = renderToggleHook();

    expect(result.current.areActivityLinksReady).toBe(false);

    await act(() => result.current.toggleActivityLink('linked-thread-id'));

    expect(mockCreateOneRecord).not.toHaveBeenCalled();
    expect(mockDeleteOneRecord).not.toHaveBeenCalled();
    expect(mockRefetch).not.toHaveBeenCalled();
    expect(mockRefetchQueries).not.toHaveBeenCalled();

    mockUseFindManyRecords.mockReturnValue({
      records: [{ id: 'target-id', messageThreadId: 'linked-thread-id' }],
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    });
    rerender();

    expect(result.current.areActivityLinksReady).toBe(true);

    await act(() => result.current.toggleActivityLink('linked-thread-id'));

    expect(mockDeleteOneRecord).toHaveBeenCalledWith('target-id');
    expect(mockCreateOneRecord).not.toHaveBeenCalled();
  });

  it('should not change links when they failed to load', async () => {
    mockUseFindManyRecords.mockReturnValue({
      records: [],
      loading: false,
      error: new Error('Failed to load activity links'),
      refetch: mockRefetch,
    });

    const { result } = renderToggleHook();

    expect(result.current.areActivityLinksReady).toBe(false);

    await act(() => result.current.toggleActivityLink('linked-thread-id'));

    expect(mockCreateOneRecord).not.toHaveBeenCalled();
    expect(mockDeleteOneRecord).not.toHaveBeenCalled();
  });
});
