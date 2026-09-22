import { gql } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { useLazyFindRecordPositionInIndex } from '@/object-record/record-index/hooks/useLazyFindRecordPositionInIndex';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const mockQuery = jest.fn();
const mockDocument = gql`
  query Test {
    __typename
  }
`;
const viewFilter = { name: { ilike: '%acme%' } };
const orderBy = [{ createdAt: 'DescNullsLast' }];
const targetCreatedAt = '2024-05-01T00:00:00.000Z';
let mockCanRead = true;

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem }),
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ query: mockQuery }),
}));
jest.mock('@/object-record/hooks/useFindManyRecordsQuery', () => ({
  useFindManyRecordsQuery: () => ({ findManyRecordsQuery: mockDocument }),
}));
jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({ canReadObjectRecords: mockCanRead }),
}));
jest.mock(
  '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams',
  () => ({
    useFindManyRecordIndexTableParams: () => ({
      objectNameSingular: 'company',
      filter: viewFilter,
      orderBy,
    }),
  }),
);

const connection = (
  nodes: Record<string, unknown>[],
  totalCount: number,
) => ({
  data: {
    companies: { edges: nodes.map((node) => ({ node })), totalCount },
  },
});

const renderPosition = () =>
  renderHook(() => useLazyFindRecordPositionInIndex('company'));

describe('useLazyFindRecordPositionInIndex', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockCanRead = true;
  });

  it('counts the records the index sorts before the target', async () => {
    mockQuery
      .mockResolvedValueOnce(
        connection(
          [{ __typename: 'Company', id: 'record-1', createdAt: targetCreatedAt }],
          1,
        ),
      )
      .mockResolvedValueOnce(connection([{ id: 'record-0' }], 42));
    const { result } = renderPosition();

    await expect(
      result.current.findRecordPositionInIndex('record-1'),
    ).resolves.toBe(42);

    expect(mockQuery).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: {
          filter: { and: [viewFilter, { id: { eq: 'record-1' } }] },
          limit: 1,
        },
      }),
    );
    expect(mockQuery).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: {
          filter: {
            and: [
              viewFilter,
              {
                or: [
                  { createdAt: { gt: targetCreatedAt } },
                  {
                    and: [
                      { createdAt: { eq: targetCreatedAt } },
                      { id: { lt: 'record-1' } },
                    ],
                  },
                ],
              },
            ],
          },
          limit: 1,
        },
      }),
    );
  });

  it('returns null when the index does not contain the record', async () => {
    mockQuery.mockResolvedValueOnce(connection([], 0));
    const { result } = renderPosition();

    await expect(
      result.current.findRecordPositionInIndex('record-1'),
    ).resolves.toBeNull();
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('does not query without read permission', async () => {
    mockCanRead = false;
    const { result } = renderPosition();

    await expect(
      result.current.findRecordPositionInIndex('record-1'),
    ).resolves.toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('returns null when a query fails', async () => {
    mockQuery.mockRejectedValue(new Error('Network unavailable'));
    const { result } = renderPosition();

    await expect(
      result.current.findRecordPositionInIndex('record-1'),
    ).resolves.toBeNull();
  });
});
