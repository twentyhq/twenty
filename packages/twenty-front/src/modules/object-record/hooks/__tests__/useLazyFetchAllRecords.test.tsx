import { PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS } from '@/object-record/hooks/__mocks__/personFragments';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { type MockedResponse } from '@apollo/client/testing';
import { expect } from '@storybook/test';
import { act, renderHook, waitFor } from '@testing-library/react';
import gql from 'graphql-tag';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const defaultResponseData = {
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: '',
    endCursor: '',
  },
  totalCount: 2,
};

const mockPerson = {
  __typename: 'Person',
  updatedAt: '2021-08-03T19:20:06.000Z',
  whatsapp: {
    primaryPhoneNumber: '+1',
    primaryPhoneCountryCode: '234-567-890',
    additionalPhones: [],
  },
  linkedinLink: {
    primaryLinkUrl: 'https://www.linkedin.com',
    primaryLinkLabel: 'linkedin',
    secondaryLinks: ['https://www.linkedin.com'],
  },
  name: {
    firstName: 'firstName',
    lastName: 'lastName',
  },
  emails: {
    primaryEmail: 'email',
    additionalEmails: [],
  },
  position: 'position',
  createdBy: {
    source: 'source',
    workspaceMemberId: '1',
    name: 'name',
  },
  avatarUrl: 'avatarUrl',
  jobTitle: 'jobTitle',
  xLink: {
    primaryLinkUrl: 'https://www.linkedin.com',
    primaryLinkLabel: 'linkedin',
    secondaryLinks: ['https://www.linkedin.com'],
  },
  performanceRating: 1,
  createdAt: '2021-08-03T19:20:06.000Z',
  phones: {
    primaryPhoneNumber: '+1',
    primaryPhoneCountryCode: '234-567-890',
    additionalPhones: [],
  },
  id: '123',
  city: 'city',
  companyId: '1',
  intro: 'intro',
  deletedAt: null,
  workPreference: 'workPreference',
};

const mock: MockedResponse = {
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
                          ${PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS}
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
      limit: 30,
    },
  },
  result: jest.fn(() => ({
    data: {
      people: {
        ...defaultResponseData,
        edges: [
          {
            node: mockPerson,
            cursor: '1',
          },
          {
            node: mockPerson,
            cursor: '2',
          },
        ],
      },
    },
  })),
};

const Wrapper = getJestMetadataAndApolloMocksAndActionMenuWrapper({
  apolloMocks: [mock],
  componentInstanceId: 'recordIndexId',
  contextStoreTargetedRecordsRule: {
    mode: 'selection',
    selectedRecordIds: [],
  },
  contextStoreCurrentObjectMetadataNameSingular: 'person',
});

describe('useLazyFetchAllRecords', () => {
  const objectNameSingular = 'person';
  const objectMetadataItem = generatedMockObjectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );
  if (!objectMetadataItem) {
    throw new Error('Object metadata item not found');
  }

  it('should handle one single page', async () => {
    const { result } = renderHook(
      () =>
        useLazyFetchAllRecords({
          objectNameSingular,
          limit: 30,
        }),
      {
        wrapper: Wrapper,
      },
    );

    let res: any;

    act(() => {
      res = result.current.fetchAllRecords();
    });

    expect(result.current.isDownloading).toBe(true);

    await waitFor(() => {
      expect(result.current.isDownloading).toBe(false);
      expect(result.current.progress).toEqual({ displayType: 'number' });
    });

    expect(result.current.progress).toEqual({ displayType: 'number' });

    const finalResult = await res;

    expect(finalResult).toEqual([mockPerson, mockPerson]);
  });
});
