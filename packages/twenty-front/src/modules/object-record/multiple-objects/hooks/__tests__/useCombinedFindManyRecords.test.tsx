import { gql } from '@apollo/client';
import { renderHook, waitFor } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { type RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { useCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/useCombinedFindManyRecords';
import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

jest.mock(
  '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery',
  () => ({
    useGenerateCombinedFindManyRecordsQuery: jest.fn(),
  }),
);

const mockQuery = gql`
  query CombinedFindManyRecords(
    $filterPerson: PersonFilterInput
    $filterCompany: CompanyFilterInput
    $orderByPerson: [PersonOrderByInput]
    $orderByCompany: [CompanyOrderByInput]
    $firstPerson: Int
    $lastPerson: Int
    $afterPerson: String
    $beforePerson: String
    $firstCompany: Int
    $lastCompany: Int
    $afterCompany: String
    $beforeCompany: String
    $limitPerson: Int
    $limitCompany: Int
  ) {
    people(
      filter: $filterPerson
      orderBy: $orderByPerson
      first: $firstPerson
      after: $afterPerson
      last: $lastPerson
      before: $beforePerson
      limit: $limitPerson
    ) {
      edges {
        node {
          __typename
          id
          name {
            firstName
            lastName
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
    companies(
      filter: $filterCompany
      orderBy: $orderByCompany
      first: $firstCompany
      after: $afterCompany
      last: $lastCompany
      before: $beforeCompany
      limit: $limitCompany
    ) {
      edges {
        node {
          __typename
          id
          name
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

type RenderUseCombinedFindManyRecordsHookParams = {
  operationSignatures: RecordGqlOperationSignature[];
  mockVariables?: Record<string, any>;
  mockResponseData?: Record<string, any>;
  skip?: boolean;
  expectedResult?: Record<string, any>;
  mockQueryResult?: any;
};

const renderUseCombinedFindManyRecordsHook = async ({
  operationSignatures,
  mockVariables = {},
  mockResponseData,
  skip = false,
  expectedResult = {},
  mockQueryResult = mockQuery,
}: RenderUseCombinedFindManyRecordsHookParams) => {
  (useGenerateCombinedFindManyRecordsQuery as jest.Mock).mockReturnValue(
    mockQueryResult,
  );

  const mocks = [
    {
      request: {
        query: mockQuery,
        variables: mockVariables,
      },
      result: {
        data: mockResponseData,
      },
    },
  ];

  const { result } = renderHook(
    () => {
      const setObjectMetadataItems = useSetRecoilState(
        objectMetadataItemsState,
      );
      setObjectMetadataItems(generatedMockObjectMetadataItems);

      return useCombinedFindManyRecords({
        operationSignatures,
        skip,
      });
    },
    {
      wrapper: getJestMetadataAndApolloMocksWrapper({ apolloMocks: mocks }),
    },
  );

  expect(result.current.loading).toBe(!skip);
  expect(result.current.result).toEqual({});

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.result).toEqual(expectedResult);

  return result;
};

describe('useCombinedFindManyRecords', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return records for multiple objects', async () => {
    const mockResponseData = {
      people: {
        edges: [
          {
            node: {
              __typename: 'Person',
              id: '1',
              name: {
                firstName: 'John',
                lastName: 'Doe',
              },
            },
            cursor: 'cursor1',
          },
        ],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'cursor1',
          endCursor: 'cursor1',
        },
        totalCount: 1,
      },
      companies: {
        edges: [
          {
            node: {
              __typename: 'Company',
              id: '1',
              name: 'Twenty',
            },
            cursor: 'cursor1',
          },
        ],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'cursor1',
          endCursor: 'cursor1',
        },
        totalCount: 1,
      },
    };

    await renderUseCombinedFindManyRecordsHook({
      operationSignatures: [
        {
          objectNameSingular: 'person',
          fields: {
            id: true,
            name: {
              firstName: true,
              lastName: true,
            },
          } satisfies RecordGqlFields,
          variables: {},
        },
        {
          objectNameSingular: 'company',
          fields: {
            id: true,
            name: true,
          } satisfies RecordGqlFields,
          variables: {},
        },
      ],
      mockResponseData,
      expectedResult: {
        people: [
          {
            __typename: 'Person',
            id: '1',
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ],
        companies: [
          {
            __typename: 'Company',
            id: '1',
            name: 'Twenty',
          },
        ],
      },
    });
  });

  it('should handle forward pagination with after cursor and first limit', async () => {
    const mockResponseData = {
      people: {
        edges: [
          {
            node: {
              __typename: 'Person',
              id: '1',
              name: {
                firstName: 'John',
                lastName: 'Doe',
              },
            },
            cursor: 'cursor1',
          },
        ],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: true,
          startCursor: 'cursor1',
          endCursor: 'cursor1',
        },
        totalCount: 10,
      },
    };

    await renderUseCombinedFindManyRecordsHook({
      operationSignatures: [
        {
          objectNameSingular: 'person',
          fields: {
            id: true,
            name: {
              firstName: true,
              lastName: true,
            },
          } satisfies RecordGqlFields,
          variables: {
            limit: 1,
            cursorFilter: {
              cursor: 'previousCursor',
              cursorDirection: 'after',
            },
          },
        },
      ],
      mockVariables: {
        firstPerson: 1,
        afterPerson: 'previousCursor',
      },
      mockResponseData,
      expectedResult: {
        people: [
          {
            __typename: 'Person',
            id: '1',
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ],
      },
    });
  });

  it('should handle backward pagination with before cursor and last limit', async () => {
    const mockResponseData = {
      people: {
        edges: [
          {
            node: {
              __typename: 'Person',
              id: '2',
              name: {
                firstName: 'Jane',
                lastName: 'Smith',
              },
            },
            cursor: 'cursor2',
          },
        ],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: true,
          startCursor: 'cursor2',
          endCursor: 'cursor2',
        },
        totalCount: 10,
      },
    };

    await renderUseCombinedFindManyRecordsHook({
      operationSignatures: [
        {
          objectNameSingular: 'person',
          fields: {
            id: true,
            name: {
              firstName: true,
              lastName: true,
            },
          } satisfies RecordGqlFields,
          variables: {
            limit: 1,
            cursorFilter: {
              cursor: 'nextCursor',
              cursorDirection: 'before',
            },
          },
        },
      ],
      mockVariables: {
        lastPerson: 1,
        beforePerson: 'nextCursor',
      },
      mockResponseData,
      expectedResult: {
        people: [
          {
            __typename: 'Person',
            id: '2',
            name: {
              firstName: 'Jane',
              lastName: 'Smith',
            },
          },
        ],
      },
    });
  });

  it('should handle limit-based pagination without cursor', async () => {
    const mockResponseData = {
      people: {
        edges: [
          {
            node: {
              __typename: 'Person',
              id: '3',
              name: {
                firstName: 'Alice',
                lastName: 'Johnson',
              },
            },
            cursor: 'cursor3',
          },
        ],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: 'cursor3',
          endCursor: 'cursor3',
        },
        totalCount: 10,
      },
    };

    await renderUseCombinedFindManyRecordsHook({
      operationSignatures: [
        {
          objectNameSingular: 'person',
          fields: {
            id: true,
            name: {
              firstName: true,
              lastName: true,
            },
          } satisfies RecordGqlFields,
          variables: {
            limit: 1,
          },
        },
      ],
      mockVariables: {
        limitPerson: 1,
      },
      mockResponseData,
      expectedResult: {
        people: [
          {
            __typename: 'Person',
            id: '3',
            name: {
              firstName: 'Alice',
              lastName: 'Johnson',
            },
          },
        ],
      },
    });
  });

  it('should handle multiple objects with different pagination strategies', async () => {
    const mockResponseData = {
      people: {
        edges: [
          {
            node: {
              __typename: 'Person',
              id: '1',
              name: {
                firstName: 'John',
                lastName: 'Doe',
              },
            },
            cursor: 'cursor1',
          },
        ],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: 'cursor1',
          endCursor: 'cursor1',
        },
        totalCount: 10,
      },
      companies: {
        edges: [
          {
            node: {
              __typename: 'Company',
              id: '1',
              name: 'Twenty',
            },
            cursor: 'cursor1',
          },
        ],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'cursor1',
          endCursor: 'cursor1',
        },
        totalCount: 1,
      },
    };

    await renderUseCombinedFindManyRecordsHook({
      operationSignatures: [
        {
          objectNameSingular: 'person',
          fields: {
            id: true,
            name: {
              firstName: true,
              lastName: true,
            },
          } satisfies RecordGqlFields,
          variables: {
            limit: 1,
            cursorFilter: {
              cursor: 'previousCursor',
              cursorDirection: 'after',
            },
          },
        },
        {
          objectNameSingular: 'company',
          fields: {
            id: true,
            name: true,
          } satisfies RecordGqlFields,
          variables: {
            limit: 1,
          },
        },
      ],
      mockVariables: {
        firstPerson: 1,
        afterPerson: 'previousCursor',
        limitCompany: 1,
      },
      mockResponseData,
      expectedResult: {
        people: [
          {
            __typename: 'Person',
            id: '1',
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ],
        companies: [
          {
            __typename: 'Company',
            id: '1',
            name: 'Twenty',
          },
        ],
      },
    });
  });

  it('should handle empty operation signatures', async () => {
    await renderUseCombinedFindManyRecordsHook({
      operationSignatures: [],
      mockResponseData: {},
      expectedResult: {},
    });
  });

  it('should handle skip flag', async () => {
    await renderUseCombinedFindManyRecordsHook({
      operationSignatures: [
        {
          objectNameSingular: 'person',
          fields: {
            id: true,
          } satisfies RecordGqlFields,
          variables: {},
        },
      ],
      skip: true,
      mockResponseData: {},
      expectedResult: {},
    });
  });
});
