import { act, renderHook } from '@testing-library/react';

import { getTimelineCalendarEventsFromObjectRecord } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromObjectRecord';
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

  const renderCalendarResolver = (extraVariables?: Record<string, string>) =>
    renderHook(
      ({ extraVariables }) =>
        useCustomResolver({
          query: getTimelineCalendarEventsFromObjectRecord,
          queryName: 'getTimelineCalendarEventsFromObjectRecord',
          objectName: 'timelineCalendarEvents',
          activityTargetableObject: {
            id: 'record-id',
            targetObjectNameSingular: 'company',
          },
          pageSize: 10,
          extraVariables,
        }),
      { initialProps: { extraVariables } },
    );

  const mockLoadedCalendarEvents = (count: number) => ({
    data: {
      getTimelineCalendarEventsFromObjectRecord: {
        timelineCalendarEvents: Array.from({ length: count }, (_, index) => ({
          id: `event-${index}`,
        })),
      },
    },
    loading: false,
    fetchMore: jest.fn(),
    error: undefined,
  });

  it('merges extra variables into the query variables', () => {
    renderCalendarResolver({ startsAtFrom: '2026-03-01T00:00:00Z' });

    expect(useQueryMock).toHaveBeenCalledWith(
      getTimelineCalendarEventsFromObjectRecord,
      expect.objectContaining({
        variables: {
          objectNameSingular: 'company',
          recordId: 'record-id',
          page: 1,
          pageSize: 10,
          startsAtFrom: '2026-03-01T00:00:00Z',
        },
      }),
    );
  });

  it('fetches the page that follows the loaded records', async () => {
    const twoPagesLoaded = mockLoadedCalendarEvents(20);

    useQueryMock.mockReturnValue(twoPagesLoaded);

    const { result, rerender } = renderCalendarResolver();

    await act(() => result.current.fetchMoreRecords());

    const onePageLoadedAfterFilterChange = mockLoadedCalendarEvents(10);

    useQueryMock.mockReturnValue(onePageLoadedAfterFilterChange);

    rerender({ extraVariables: { startsAtFrom: '2026-03-01T00:00:00Z' } });

    await act(() => result.current.fetchMoreRecords());

    expect(twoPagesLoaded.fetchMore).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ page: 3 }),
      }),
    );
    expect(onePageLoadedAfterFilterChange.fetchMore).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          page: 2,
          startsAtFrom: '2026-03-01T00:00:00Z',
        }),
      }),
    );
  });
});
