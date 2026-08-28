import { gql } from '@apollo/client';
import { renderHook } from '@testing-library/react';

import { useSuspenseCustomResolver } from '@/activities/hooks/useSuspenseCustomResolver';

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useSuspenseQuery: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: jest.fn(() => ({ mockedClient: true })),
}));

jest.mock('@/apollo/hooks/useSnackBarOnQueryError', () => ({
  useSnackBarOnQueryError: jest.fn(),
}));

const useSuspenseQueryMock = jest.requireMock('@apollo/client/react')
  .useSuspenseQuery as jest.Mock;

const PROBE_QUERY = gql`
  query GetTimelineThreadsFromObjectRecord(
    $objectNameSingular: String!
    $recordId: UUID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineThreadsFromObjectRecord(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
      page: $page
      pageSize: $pageSize
    ) {
      totalNumberOfThreads
    }
  }
`;

describe('useSuspenseCustomResolver', () => {
  beforeEach(() => {
    useSuspenseQueryMock.mockReturnValue({
      data: {
        getTimelineThreadsFromObjectRecord: { totalNumberOfThreads: 2 },
      },
      error: undefined,
      fetchMore: jest.fn(),
      refetch: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('queries the custom resolver with page-one variables', () => {
    const { result } = renderHook(() =>
      useSuspenseCustomResolver(
        PROBE_QUERY,
        'getTimelineThreadsFromObjectRecord',
        'timelineThreads',
        { id: 'record-id', targetObjectNameSingular: 'person' },
        10,
      ),
    );

    expect(useSuspenseQueryMock).toHaveBeenCalledWith(
      PROBE_QUERY,
      expect.objectContaining({
        variables: {
          objectNameSingular: 'person',
          recordId: 'record-id',
          page: 1,
          pageSize: 10,
        },
        errorPolicy: 'all',
      }),
    );

    expect(
      result.current.data?.getTimelineThreadsFromObjectRecord
        .totalNumberOfThreads,
    ).toBe(2);
    expect(result.current.isFetchingMore).toBe(false);
  });
});
