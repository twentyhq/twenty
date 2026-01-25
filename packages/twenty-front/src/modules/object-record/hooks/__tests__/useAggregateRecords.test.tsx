import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import {
  AGGREGATE_QUERY,
  mockResponse,
} from '@/object-record/hooks/__mocks__/useAggregateRecords';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import {
  type GqlFieldToFieldMap,
  useAggregateRecordsQuery,
} from '@/object-record/hooks/useAggregateRecordsQuery';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import {
  ApolloClient,
  ApolloError,
  InMemoryCache,
  useQuery,
} from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { getTestMetadataAndApolloMocksWrapper } from '~/testing/test-helpers/getTestMetadataAndApolloMocksWrapper';

// Mocks
vi.mock('@apollo/client');
vi.mock('@/object-metadata/hooks/useObjectMetadataItem');
vi.mock('@/object-record/hooks/useAggregateRecordsQuery');

const mockObjectMetadataItem = {
  id: '1',
  nameSingular: 'opportunity',
  namePlural: 'opportunities',
  labelSingular: 'Opportunity',
  labelPlural: 'Opportunities',
  description: null,
  icon: null,
  createdAt: '',
  updatedAt: '',
  isActive: true,
  isCustom: false,
  isSystem: false,
  isRemote: false,
  isSearchable: true,
  isUIReadOnly: false,
  isLabelSyncedWithName: false,
  applicationId: '',
  shortcut: null,
  duplicateCriteria: null,
  standardOverrides: null,
  labelIdentifierFieldMetadataId: '',
  imageIdentifierFieldMetadataId: null,
  fields: [],
  readableFields: [],
  updatableFields: [],
  indexMetadatas: [],
};

const mockGqlFieldToFieldMap: GqlFieldToFieldMap = {
  sumAmount: ['amount', AggregateOperations.SUM],
  avgAmount: ['amount', AggregateOperations.AVG],
  totalCount: ['name', AggregateOperations.COUNT],
};

const Wrapper = getTestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useAggregateRecords', () => {
  beforeEach(() => {
    vi.mocked(useObjectMetadataItem).mockReturnValue({
      objectMetadataItem: mockObjectMetadataItem,
    });

    vi.mocked(useAggregateRecordsQuery).mockReturnValue({
      aggregateQuery: AGGREGATE_QUERY,
      gqlFieldToFieldMap: mockGqlFieldToFieldMap,
    });

    const mockApolloClient = new ApolloClient({
      uri: 'http://localhost',
      cache: new InMemoryCache(),
    });
    vi.mocked(useQuery).mockReturnValue({
      data: mockResponse,
      loading: false,
      error: undefined,
      client: mockApolloClient,
      observable: {} as any,
      networkStatus: 7,
      called: true,
      fetchMore: vi.fn(),
      refetch: vi.fn(),
      reobserve: vi.fn(),
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
      subscribeToMore: vi.fn(),
      updateQuery: vi.fn(),
      variables: {},
      previousData: undefined,
    });
  });

  it('should format data correctly', () => {
    const { result } = renderHook(
      () =>
        useAggregateRecords({
          objectNameSingular: 'opportunity',
          recordGqlFieldsAggregate: {
            amount: [AggregateOperations.SUM, AggregateOperations.AVG],
            name: [AggregateOperations.COUNT],
          },
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.data).toEqual({
      amount: {
        [AggregateOperations.SUM]: 1000000,
        [AggregateOperations.AVG]: 23800,
      },
      name: {
        [AggregateOperations.COUNT]: 42,
      },
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle loading state', () => {
    const mockApolloClient = new ApolloClient({
      uri: 'http://localhost',
      cache: new InMemoryCache(),
    });
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      client: mockApolloClient,
      observable: {} as any,
      networkStatus: 1,
      called: false,
      fetchMore: vi.fn(),
      refetch: vi.fn(),
      reobserve: vi.fn(),
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
      subscribeToMore: vi.fn(),
      updateQuery: vi.fn(),
      variables: {},
      previousData: undefined,
    });

    const { result } = renderHook(
      () =>
        useAggregateRecords({
          objectNameSingular: 'opportunity',
          recordGqlFieldsAggregate: {
            amount: [AggregateOperations.SUM],
          },
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', () => {
    const mockError = new ApolloError({
      errorMessage: 'Query failed',
      graphQLErrors: [],
      networkError: null,
    });
    const mockApolloClient = new ApolloClient({
      uri: 'http://localhost',
      cache: new InMemoryCache(),
    });
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      loading: false,
      error: mockError,
      client: mockApolloClient,
      observable: {} as any,
      networkStatus: 8,
      called: true,
      fetchMore: vi.fn(),
      refetch: vi.fn(),
      reobserve: vi.fn(),
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
      subscribeToMore: vi.fn(),
      updateQuery: vi.fn(),
      variables: {},
      previousData: undefined,
    });

    const { result } = renderHook(
      () =>
        useAggregateRecords({
          objectNameSingular: 'opportunity',
          recordGqlFieldsAggregate: {
            amount: [AggregateOperations.SUM],
          },
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.data).toEqual({});
    expect(result.current.error).toBe(mockError);
  });

  it('should skip query when specified', () => {
    renderHook(
      () =>
        useAggregateRecords({
          objectNameSingular: 'opportunity',
          recordGqlFieldsAggregate: {
            amount: [AggregateOperations.SUM],
          },
          skip: true,
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(useQuery).toHaveBeenCalledWith(
      AGGREGATE_QUERY,
      expect.objectContaining({
        skip: true,
      }),
    );
  });
});
