import { renderHook } from '@testing-library/react';

import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';

const mockUseQuery = jest.fn();
jest.mock('@apollo/client/react', () => ({
  useQuery: () => mockUseQuery(),
}));

jest.mock('@/auth/states/currentWorkspaceMemberState', () => ({
  currentWorkspaceMemberState: {},
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ id: 'workspace-member-id' }),
}));

jest.mock('@/object-metadata/hooks/useDoObjectMetadataItemsExist', () => ({
  useDoObjectMetadataItemsExist: () => true,
}));

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({}),
}));

describe('useObjectRecordSearchRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses data from cache when loading is true and dataState is complete', () => {
    const cachedNode = {
      id: 'member-1',
      recordId: 'member-1',
      name: 'John Doe',
      objectNameSingular: 'workspaceMember',
    };

    mockUseQuery.mockReturnValue({
      data: {
        search: {
          edges: [{ node: cachedNode }],
        },
      },
      dataState: 'complete',
      loading: true,
      previousData: undefined,
      error: undefined,
    });

    const { result } = renderHook(() =>
      useObjectRecordSearchRecords({
        objectNameSingulars: ['workspaceMember'],
        searchInput: '',
      }),
    );

    expect(result.current.searchRecords).toEqual([cachedNode]);
    expect(result.current.loading).toBe(false);
  });

  it('falls back to previousData when data is undefined while loading', () => {
    const previousNode = {
      id: 'member-2',
      recordId: 'member-2',
      name: 'Jane Smith',
      objectNameSingular: 'workspaceMember',
    };

    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      previousData: {
        search: {
          edges: [{ node: previousNode }],
        },
      },
      error: undefined,
    });

    const { result } = renderHook(() =>
      useObjectRecordSearchRecords({
        objectNameSingulars: ['workspaceMember'],
        searchInput: 'Jane',
      }),
    );

    expect(result.current.searchRecords).toEqual([previousNode]);
    expect(result.current.loading).toBe(true);
  });

  it('returns empty array when neither data nor previousData is available', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      previousData: undefined,
      error: undefined,
    });

    const { result } = renderHook(() =>
      useObjectRecordSearchRecords({
        objectNameSingulars: ['workspaceMember'],
        searchInput: '',
      }),
    );

    expect(result.current.searchRecords).toEqual([]);
    expect(result.current.loading).toBe(true);
  });
});
