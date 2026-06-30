import { renderHook } from '@testing-library/react';

import { getTimelineThreadsFromObjectRecord } from '@/activities/emails/graphql/queries/getTimelineThreadsFromObjectRecord';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: jest.fn(() => ({})),
}));

jest.mock('@/apollo/hooks/useSnackBarOnQueryError', () => ({
  useSnackBarOnQueryError: jest.fn(),
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
      useCustomResolver(
        getTimelineThreadsFromObjectRecord,
        'getTimelineThreadsFromObjectRecord',
        'timelineThreads',
        { id: 'record-id', targetObjectNameSingular: 'peopleList' },
        10,
      ),
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
});
