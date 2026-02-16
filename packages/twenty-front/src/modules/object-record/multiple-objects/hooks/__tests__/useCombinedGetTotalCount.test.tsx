import { gql } from '@apollo/client';
import { renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';

import { useCombinedGetTotalCount } from '@/object-record/multiple-objects/hooks/useCombinedGetTotalCount';
import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock(
  '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery',
  () => ({
    useGenerateCombinedFindManyRecordsQuery: jest.fn(),
  }),
);

const mockQuery = gql`
  query CombinedFindManyRecords {
    companies {
      totalCount
    }
    apiKeys {
      totalCount
    }
  }
`;

describe('useCombinedGetTotalCount', () => {
  const companyObjectMetadataItem = generatedMockObjectMetadataItems.find(
    ({ nameSingular }) => nameSingular === 'company',
  );
  const apiKeyObjectMetadataItem = generatedMockObjectMetadataItems.find(
    ({ nameSingular }) => nameSingular === 'apiKey',
  );

  beforeEach(() => {
    (useGenerateCombinedFindManyRecordsQuery as jest.Mock).mockReturnValue(
      mockQuery,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should keep available totals when one object resolver fails', async () => {
    if (!companyObjectMetadataItem || !apiKeyObjectMetadataItem) {
      throw new Error('Missing required mock object metadata items');
    }

    const mocks = [
      {
        request: {
          query: mockQuery,
        },
        result: {
          data: {
            companies: {
              totalCount: 7,
            },
            apiKeys: null,
          },
          errors: [new GraphQLError('Forbidden')],
        },
      },
    ];

    const { result } = renderHook(
      () =>
        useCombinedGetTotalCount({
          objectMetadataItems: [
            companyObjectMetadataItem,
            apiKeyObjectMetadataItem,
          ],
        }),
      {
        wrapper: getJestMetadataAndApolloMocksWrapper({ apolloMocks: mocks }),
      },
    );

    await waitFor(() => {
      expect(
        result.current.totalCountByObjectMetadataItemNamePlural.companies,
      ).toBe(7);
    });

    expect(result.current.totalCountByObjectMetadataItemNamePlural).toEqual({
      companies: 7,
    });
  });

  it('should map totals when every object succeeds', async () => {
    if (!companyObjectMetadataItem || !apiKeyObjectMetadataItem) {
      throw new Error('Missing required mock object metadata items');
    }

    const mocks = [
      {
        request: {
          query: mockQuery,
        },
        result: {
          data: {
            companies: {
              totalCount: 7,
            },
            apiKeys: {
              totalCount: 3,
            },
          },
        },
      },
    ];

    const { result } = renderHook(
      () =>
        useCombinedGetTotalCount({
          objectMetadataItems: [
            companyObjectMetadataItem,
            apiKeyObjectMetadataItem,
          ],
        }),
      {
        wrapper: getJestMetadataAndApolloMocksWrapper({ apolloMocks: mocks }),
      },
    );

    await waitFor(() => {
      expect(
        result.current.totalCountByObjectMetadataItemNamePlural.companies,
      ).toBe(7);
      expect(
        result.current.totalCountByObjectMetadataItemNamePlural.apiKeys,
      ).toBe(3);
    });
  });
});
