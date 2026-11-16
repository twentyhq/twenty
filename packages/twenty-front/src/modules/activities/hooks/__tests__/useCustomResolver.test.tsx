import { NetworkStatus } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';

import { getTimelineThreadsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadsFromObjectRecord';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: jest.fn(() => ({})),
}));

const useQueryMock = jest.requireMock('@apollo/client/react').useQuery;

describe('useCustomResolver', () => {
  beforeEach(() => {
    useQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      fetchMore: jest.fn(),
      error: undefined,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('queries the timeline resolver by object name and record id for any object', () => {
    renderHook(() =>
      useCustomResolver({
        query: getTimelineThreadsFromObjectRecord,
        queryName: 'getTimelineThreadsFromObjectRecord',
        objectName: 'timelineThreads',
        activityTargetableObject: {
          id: 'record-id',
          targetObjectNameSingular: 'peopleList',
        },
        pageSize: 10,
      }),
    );

    expect(useQueryMock).toHaveBeenCalledWith(
      getTimelineThreadsFromObjectRecord,
      expect.objectContaining({
        variables: {
          objectNameSingular: 'peopleList',
          recordId: 'record-id',
          page: 1,
          pageSize: 10,
        },
      }),
    );
  });

  const renderTimelineResolver = () =>
    renderHook(() =>
      useCustomResolver({
        query: getTimelineThreadsFromObjectRecord,
        queryName: 'getTimelineThreadsFromObjectRecord',
        objectName: 'timelineThreads',
        activityTargetableObject: {
          id: 'record-id',
          targetObjectNameSingular: 'company',
        },
        pageSize: 2,
      }),
    );

  const buildThreadsData = (count: number) => ({
    getTimelineThreadsFromObjectRecord: {
      timelineThreads: Array.from({ length: count }, (_, index) => ({
        id: `thread-${index}`,
      })),
    },
  });

  const mockLoadedThreads = ({
    count,
    loading,
    fetchedCount = 0,
  }: {
    count: number;
    loading: boolean;
    fetchedCount?: number;
  }) => {
    const fetchMore = jest.fn(async ({ updateQuery }) => {
      updateQuery(buildThreadsData(count), {
        fetchMoreResult: buildThreadsData(fetchedCount),
      });
    });

    useQueryMock.mockReturnValue({
      data: buildThreadsData(count),
      loading,
      fetchMore,
      error: undefined,
    });

    return fetchMore;
  };

  const expectRequestedPage = ({
    fetchMore,
    page,
  }: {
    fetchMore: jest.Mock;
    page: number;
  }) =>
    expect(fetchMore).toHaveBeenLastCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ page }),
      }),
    );

  it('requests page 2 once a remount has reloaded the first page over the cached pages', async () => {
    mockLoadedThreads({ count: 4, loading: true });
    useQueryMock.mockReturnValue({
      ...useQueryMock(),
      networkStatus: NetworkStatus.loading,
    });
    const { result, rerender } = renderTimelineResolver();

    const reloadedFetchMore = mockLoadedThreads({ count: 2, loading: false });
    rerender();

    await act(() => result.current.fetchMoreRecords());
    expectRequestedPage({ fetchMore: reloadedFetchMore, page: 2 });
  });

  it('waits for the first page to reload before requesting more', async () => {
    const fetchMore = mockLoadedThreads({ count: 4, loading: true });
    const { result } = renderTimelineResolver();

    await act(() => result.current.fetchMoreRecords());

    expect(fetchMore).not.toHaveBeenCalled();
  });

  it('keeps paginating after a page shorter than the page size', async () => {
    const fetchMore = mockLoadedThreads({
      count: 2,
      loading: false,
      fetchedCount: 1,
    });
    const { result, rerender } = renderTimelineResolver();

    await act(() => result.current.fetchMoreRecords());
    expectRequestedPage({ fetchMore, page: 2 });

    const nextFetchMore = mockLoadedThreads({ count: 3, loading: false });
    rerender();

    await act(() => result.current.fetchMoreRecords());
    expectRequestedPage({ fetchMore: nextFetchMore, page: 3 });
  });

  it('stops once a page comes back empty', async () => {
    const fetchMore = mockLoadedThreads({ count: 2, loading: false });
    const { result } = renderTimelineResolver();

    await act(() => result.current.fetchMoreRecords());
    await act(() => result.current.fetchMoreRecords());

    expect(fetchMore).toHaveBeenCalledTimes(1);
  });

  it('starts over from the second page after the list is refetched', async () => {
    const fetchMore = mockLoadedThreads({
      count: 2,
      loading: false,
      fetchedCount: 2,
    });
    const { result, rerender } = renderTimelineResolver();

    await act(() => result.current.fetchMoreRecords());
    expectRequestedPage({ fetchMore, page: 2 });

    mockLoadedThreads({ count: 2, loading: true });
    useQueryMock.mockReturnValue({
      ...useQueryMock(),
      networkStatus: NetworkStatus.refetch,
    });
    rerender();

    const refetchedFetchMore = mockLoadedThreads({ count: 2, loading: false });
    rerender();

    await act(() => result.current.fetchMoreRecords());
    expectRequestedPage({ fetchMore: refetchedFetchMore, page: 2 });
  });

  it('resumes paginating after a refetch that follows the last page', async () => {
    const fetchMore = mockLoadedThreads({ count: 2, loading: false });
    const { result, rerender } = renderTimelineResolver();

    await act(() => result.current.fetchMoreRecords());
    expectRequestedPage({ fetchMore, page: 2 });

    mockLoadedThreads({ count: 2, loading: true });
    useQueryMock.mockReturnValue({
      ...useQueryMock(),
      networkStatus: NetworkStatus.refetch,
    });
    rerender();

    const refetchedFetchMore = mockLoadedThreads({
      count: 2,
      loading: false,
      fetchedCount: 1,
    });
    rerender();

    await act(() => result.current.fetchMoreRecords());
    expectRequestedPage({ fetchMore: refetchedFetchMore, page: 2 });
  });
});
