import { useQuery } from '@apollo/client/react';
import { renderHook } from '@testing-library/react';

import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useQuery: jest.fn(),
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: jest.fn(),
}));
jest.mock('@/object-metadata/hooks/useDoObjectMetadataItemsExist', () => ({
  useDoObjectMetadataItemsExist: () => true,
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ id: 'current-workspace-member' }),
}));

const buildSearchResult = (recordIds: string[]) => ({
  search: {
    edges: recordIds.map((recordId) => ({
      node: { recordId, objectNameSingular: 'workspaceMember' },
    })),
  },
});

const renderSearchRecords = (
  queryResult: Partial<ReturnType<typeof useQuery>>,
) => {
  jest.mocked(useQuery).mockReturnValue({
    data: undefined,
    previousData: undefined,
    dataState: 'empty',
    loading: false,
    error: undefined,
    ...queryResult,
  } as ReturnType<typeof useQuery>);

  return renderHook(() =>
    useObjectRecordSearchRecords({
      objectNameSingulars: ['workspaceMember'],
      searchInput: '',
      fetchPolicy: 'cache-and-network',
    }),
  );
};

describe('useObjectRecordSearchRecords', () => {
  it('returns cached records for the current input while they are refreshed', () => {
    const { result } = renderSearchRecords({
      loading: true,
      dataState: 'complete',
      data: buildSearchResult(['tim']),
    });

    expect(result.current.loading).toBe(false);
    expect(
      result.current.searchRecords.map(({ recordId }) => recordId),
    ).toEqual(['tim']);
  });

  it('keeps the previous records while the current input has no data yet', () => {
    const { result } = renderSearchRecords({
      loading: true,
      dataState: 'empty',
      previousData: buildSearchResult(['scott']),
    });

    expect(result.current.loading).toBe(true);
    expect(
      result.current.searchRecords.map(({ recordId }) => recordId),
    ).toEqual(['scott']);
  });

  it('returns the fetched records once loaded', () => {
    const { result } = renderSearchRecords({
      dataState: 'complete',
      data: buildSearchResult(['phil']),
      previousData: buildSearchResult(['scott']),
    });

    expect(result.current.loading).toBe(false);
    expect(
      result.current.searchRecords.map(({ recordId }) => recordId),
    ).toEqual(['phil']);
  });
});
