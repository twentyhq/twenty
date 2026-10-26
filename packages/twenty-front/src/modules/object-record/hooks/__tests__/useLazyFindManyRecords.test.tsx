import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { act, renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';

const mockFindWithCount = jest.fn();
const mockFindWithoutCount = jest.fn();
const mockHandleError = jest.fn();
const mockClient = { query: mockFindWithoutCount };
const mockObjectMetadata = {
  id: 'company-metadata',
  nameSingular: 'company',
  namePlural: 'companies',
};

jest.mock('@apollo/client/react', () => ({
  useLazyQuery: () => [mockFindWithCount, {}],
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => mockClient,
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem: mockObjectMetadata }),
}));
jest.mock('@/object-record/hooks/useFindManyRecordsQuery', () => ({
  useFindManyRecordsQuery: ({
    includeTotalCount = true,
  }: {
    includeTotalCount?: boolean;
  }) => ({
    findManyRecordsQuery: includeTotalCount ? 'with-count' : 'without-count',
  }),
}));
jest.mock('@/object-record/hooks/useHandleFindManyRecordsError', () => ({
  useHandleFindManyRecordsError: () => ({
    handleFindManyRecordsError: mockHandleError,
  }),
}));
jest.mock(
  '@/object-record/hooks/useLazyFetchMoreRecordsWithPagination',
  () => ({ useLazyFetchMoreRecordsWithPagination: () => ({}) }),
);
jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({ canReadObjectRecords: true }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <Provider>{children}</Provider>
);
const page = {
  data: {
    companies: {
      edges: [{ node: { id: 'visible-company' }, cursor: 'cursor' }],
      pageInfo: { hasNextPage: true, endCursor: 'cursor' },
    },
  },
};
const timeoutError = new CombinedGraphQLErrors({
  errors: [
    new GraphQLError('Read timeout', {
      extensions: { subCode: 'QUERY_READ_TIMEOUT' },
    }),
  ],
});
const filter = { name: { eq: 'Visible' } };

const rejectFirstQuery = (error: Error) =>
  mockFindWithCount.mockImplementation(() => {
    const promise = Promise.reject(error);
    return Object.assign(promise, { retain: () => promise });
  });

describe('useLazyFindManyRecords count fallback', () => {
  beforeEach(() => jest.clearAllMocks());

  it('keeps the filter and page limit when retrying without a count', async () => {
    rejectFirstQuery(timeoutError);
    mockFindWithoutCount.mockResolvedValue(page);
    const { result } = renderHook(
      () =>
        useLazyFindManyRecords({
          objectNameSingular: 'company',
          filter,
          limit: 50,
          allowMissingTotalCountOnTimeout: true,
        }),
      { wrapper: Wrapper },
    );
    await act(async () => {
      const records = await result.current.findManyRecordsLazy();
      expect(records).toMatchObject({
        records: [{ id: 'visible-company' }],
        hasNextPage: true,
        isTotalCountKnown: false,
      });
    });
    expect(mockFindWithoutCount).toHaveBeenCalledWith({
      query: 'without-count',
      variables: { filter, limit: 50, orderBy: undefined },
      fetchPolicy: 'network-only',
    });
    expect(mockHandleError).not.toHaveBeenCalled();
  });

  it('reports a page timeout rather than presenting an empty successful page', async () => {
    rejectFirstQuery(timeoutError);
    mockFindWithoutCount.mockRejectedValue(timeoutError);
    const { result } = renderHook(
      () =>
        useLazyFindManyRecords({
          objectNameSingular: 'company',
          allowMissingTotalCountOnTimeout: true,
        }),
      { wrapper: Wrapper },
    );
    await act(async () => {
      await expect(result.current.findManyRecordsLazy()).rejects.toBe(
        timeoutError,
      );
    });
    expect(mockHandleError).toHaveBeenCalledWith(timeoutError);
  });
});
