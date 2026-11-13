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

  const mockLoadedThreads = ({
    count,
    loading,
  }: {
    count: number;
    loading: boolean;
  }) => {
    const fetchMore = jest.fn().mockResolvedValue(undefined);

    useQueryMock.mockReturnValue({
      data: {
        getTimelineThreadsFromObjectRecord: {
          timelineThreads: Array.from({ length: count }, (_, index) => ({
            id: `thread-${index}`,
          })),
        },
      },
      loading,
      fetchMore,
      error: undefined,
    });

    return fetchMore;
  };

  it('requests the page after the rows already in the cache', async () => {
    const fetchMore = mockLoadedThreads({ count: 4, loading: false });
    const { result } = renderTimelineResolver();

    await act(() => result.current.fetchMoreRecords());

    expect(fetchMore).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ page: 3 }),
      }),
    );
  });

  it('waits for the first page to reload before requesting more', async () => {
    const fetchMore = mockLoadedThreads({ count: 4, loading: true });
    const { result } = renderTimelineResolver();

    await act(() => result.current.fetchMoreRecords());

    expect(fetchMore).not.toHaveBeenCalled();
  });

  it('stops after a partial last page instead of requesting it again', async () => {
    const fetchMore = mockLoadedThreads({ count: 5, loading: false });
    const { result } = renderTimelineResolver();

    await act(() => result.current.fetchMoreRecords());

    expect(fetchMore).not.toHaveBeenCalled();
  });
});
