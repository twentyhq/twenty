import { renderHook, waitFor } from '@testing-library/react';
import gql from 'graphql-tag';

import { useFindDuplicateRecords } from '@/object-record/hooks/useFindDuplicateRecords';

import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useFindDuplicateRecords';

jest.mock('@/object-record/hooks/useFindDuplicatesRecordsQuery', () => ({
  useFindDuplicateRecordsQuery: ({
    objectNameSingular,
  }: {
    objectNameSingular: string;
  }) => ({
    findDuplicateRecordsQuery:
      objectNameSingular === 'company'
        ? gql`
            query FindDuplicateCompany(
              $ids: [UUID!]
              $data: [CompanyCreateInput!]
            ) {
              companyDuplicates(ids: $ids, data: $data) {
                edges {
                  node {
                    id
                    name
                    domainName {
                      primaryLinkUrl
                    }
                  }
                  cursor
                }
                pageInfo {
                  hasNextPage
                  startCursor
                  endCursor
                }
              }
            }
          `
        : query,
  }),
}));

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: responseData,
    })),
  },
  {
    request: {
      query: gql`
        query FindDuplicateCompany(
          $ids: [UUID!]
          $data: [CompanyCreateInput!]
        ) {
          companyDuplicates(ids: $ids, data: $data) {
            edges {
              node {
                id
                name
                domainName {
                  primaryLinkUrl
                }
              }
              cursor
            }
            pageInfo {
              hasNextPage
              startCursor
              endCursor
            }
          }
        }
      `,
      variables: {
        data: [
          {
            name: 'No Match Inc',
            domainName: 'nomatch.dev',
          },
        ],
      },
    },
    result: jest.fn(() => ({
      data: {
        companyDuplicates: [],
      },
    })),
  },
];

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useFindDuplicateRecords', () => {
  it('should fetch duplicate records and return the correct data', async () => {
    const objectRecordId = '6205681e-7c11-40b4-9e32-f523dbe54590';
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useFindDuplicateRecords({
          objectRecordIds: [objectRecordId],
          objectNameSingular,
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.results).toBeDefined();
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });

  it('should return an empty duplicates array for data-based duplicate lookups', async () => {
    const objectNameSingular = 'company';

    const { result } = renderHook(
      () =>
        useFindDuplicateRecords({
          data: [
            {
              name: 'No Match Inc',
              domainName: 'nomatch.dev',
            },
          ],
          objectNameSingular,
        }),
      {
        wrapper: Wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.results).toEqual([]);
    expect(mocks[1].result).toHaveBeenCalled();
  });
});
