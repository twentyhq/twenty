import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';

import { RecordTableContextProvider } from '@/object-record/record-table/components/RecordTableContextProvider';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type MockedResponse } from '@apollo/client/testing';
import gql from 'graphql-tag';
import { QUERY_DEFAULT_LIMIT_RECORDS } from 'twenty-shared/constants';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { JestRecordIndexContextProviderWrapper } from '~/testing/jest/JestRecordIndexContextProviderWrapper';
import {
  getMockPersonObjectMetadataItem,
  peopleQueryResult,
} from '~/testing/mock-data/people';

const recordTableId = 'people';
const objectNameSingular = 'person';
const mockPersonObjectMetadataItem = getMockPersonObjectMetadataItem();

const ObjectNamePluralSetter = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        query FindManyPeople(
          $filter: PersonFilterInput
          $orderBy: [PersonOrderByInput]
          $lastCursor: String
          $limit: Int
          $offset: Int
        ) {
          people(
            filter: $filter
            orderBy: $orderBy
            first: $limit
            after: $lastCursor
            offset: $offset
          ) {
            edges {
              node {
                __typename
                avatarUrl
                createdAt
                deletedAt
                id
                name {
                  firstName
                  lastName
                }
                noteTargets {
                  edges {
                    node {
                      __typename
                      id
                      note {
                        __typename
                        id
                        title
                      }
                    }
                  }
                }
                position
                taskTargets {
                  edges {
                    node {
                      __typename
                      id
                      task {
                        __typename
                        id
                        title
                      }
                    }
                  }
                }
                updatedAt
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
      `,
      variables: {
        filter: {},
        orderBy: [{ position: 'AscNullsFirst' }],
        limit: QUERY_DEFAULT_LIMIT_RECORDS,
      },
    },
    result: jest.fn(() => ({
      data: {
        people: peopleQueryResult.people,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        totalCount: 16,
      },
    })),
  },
];

const HookMockWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <HookMockWrapper>
      <ViewComponentInstanceContext.Provider
        value={{ instanceId: 'instanceId' }}
      >
        <RecordComponentInstanceContextsWrapper
          componentInstanceId={recordTableId}
        >
          <JestRecordIndexContextProviderWrapper
            objectMetadataItem={mockPersonObjectMetadataItem}
          >
            <RecordTableContextProvider
              objectNameSingular={objectNameSingular}
              recordTableId={recordTableId}
              viewBarId="instanceId"
            >
              <ObjectNamePluralSetter>
                <RecordTableComponentInstance recordTableId={recordTableId}>
                  <RecordGroupContext.Provider
                    value={{ recordGroupId: 'default' }}
                  >
                    {children}
                  </RecordGroupContext.Provider>
                </RecordTableComponentInstance>
              </ObjectNamePluralSetter>
            </RecordTableContextProvider>
          </JestRecordIndexContextProviderWrapper>
        </RecordComponentInstanceContextsWrapper>
      </ViewComponentInstanceContext.Provider>
    </HookMockWrapper>
  );
};

describe('useRecordIndexTableQuery', () => {
  it('should fetch', async () => {
    const { result } = renderHook(
      () => {
        const { records } = useRecordIndexTableQuery(objectNameSingular);

        return {
          records,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.records).toHaveLength(16);
    });
  });
});
