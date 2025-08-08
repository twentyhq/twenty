import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { useRecordIndexTableQuery } from '@/object-record/record-index/hooks/useRecordIndexTableQuery';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { MockedResponse } from '@apollo/client/testing';
import gql from 'graphql-tag';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { peopleQueryResult } from '~/testing/mock-data/people';

const recordTableId = 'people';
const objectNameSingular = 'person';
const onColumnsChange = jest.fn();

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
        ) {
          people(
            filter: $filter
            orderBy: $orderBy
            first: $limit
            after: $lastCursor
          ) {
            edges {
              node {
                __typename
                avatarUrl
                city
                createdAt
                createdBy {
                  source
                  workspaceMemberId
                  name
                  context
                }
                deletedAt
                emails {
                  primaryEmail
                  additionalEmails
                }
                id
                intro
                jobTitle
                linkedinLink {
                  primaryLinkUrl
                  primaryLinkLabel
                  secondaryLinks
                }
                name {
                  firstName
                  lastName
                }
                noteTargets {
                  edges {
                    node {
                      __typename
                      company {
                        __typename
                        accountOwnerId
                        address {
                          addressStreet1
                          addressStreet2
                          addressCity
                          addressState
                          addressCountry
                          addressPostcode
                          addressLat
                          addressLng
                        }
                        annualRecurringRevenue {
                          amountMicros
                          currencyCode
                        }
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        domainName {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                        employees
                        id
                        idealCustomerProfile
                        introVideo {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                        linkedinLink {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                        name
                        position
                        tagline
                        updatedAt
                        visaSponsorship
                        workPolicy
                        xLink {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                      }
                      companyId
                      createdAt
                      deletedAt
                      id
                      note {
                        __typename
                        bodyV2 {
                          blocknote
                          markdown
                        }
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        id
                        position
                        title
                        updatedAt
                      }
                      noteId
                      opportunity {
                        __typename
                        amount {
                          amountMicros
                          currencyCode
                        }
                        closeDate
                        companyId
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        id
                        name
                        pointOfContactId
                        position
                        stage
                        updatedAt
                      }
                      opportunityId
                      person {
                        __typename
                        avatarUrl
                        city
                        companyId
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        emails {
                          primaryEmail
                          additionalEmails
                        }
                        id
                        intro
                        jobTitle
                        linkedinLink {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                        name {
                          firstName
                          lastName
                        }
                        performanceRating
                        phones {
                          primaryPhoneNumber
                          primaryPhoneCountryCode
                          primaryPhoneCallingCode
                          additionalPhones
                        }
                        position
                        updatedAt
                        whatsapp {
                          primaryPhoneNumber
                          primaryPhoneCountryCode
                          primaryPhoneCallingCode
                          additionalPhones
                        }
                        workPreference
                        xLink {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                      }
                      personId
                      pet {
                        __typename
                        age
                        averageCostOfKibblePerMonth {
                          amountMicros
                          currencyCode
                        }
                        bio
                        birthday
                        comments
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        extraData
                        id
                        interestingFacts
                        isGoodWithKids
                        location {
                          addressStreet1
                          addressStreet2
                          addressCity
                          addressState
                          addressCountry
                          addressPostcode
                          addressLat
                          addressLng
                        }
                        makesOwnerThinkOf {
                          firstName
                          lastName
                        }
                        name
                        pictures {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                        position
                        soundSwag
                        species
                        traits
                        updatedAt
                        vetEmail {
                          primaryEmail
                          additionalEmails
                        }
                        vetPhone {
                          primaryPhoneNumber
                          primaryPhoneCountryCode
                          primaryPhoneCallingCode
                          additionalPhones
                        }
                      }
                      petId
                      rocket {
                        __typename
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        id
                        name
                        position
                        updatedAt
                      }
                      rocketId
                      surveyResult {
                        __typename
                        averageEstimatedNumberOfAtomsInTheUniverse
                        comments
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        id
                        name
                        participants
                        percentageOfCompletion
                        position
                        score
                        shortNotes
                        updatedAt
                      }
                      surveyResultId
                      updatedAt
                    }
                  }
                }
                performanceRating
                phones {
                  primaryPhoneNumber
                  primaryPhoneCountryCode
                  primaryPhoneCallingCode
                  additionalPhones
                }
                position
                taskTargets {
                  edges {
                    node {
                      __typename
                      company {
                        __typename
                        accountOwnerId
                        address {
                          addressStreet1
                          addressStreet2
                          addressCity
                          addressState
                          addressCountry
                          addressPostcode
                          addressLat
                          addressLng
                        }
                        annualRecurringRevenue {
                          amountMicros
                          currencyCode
                        }
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        domainName {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                        employees
                        id
                        idealCustomerProfile
                        introVideo {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                        linkedinLink {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                        name
                        position
                        tagline
                        updatedAt
                        visaSponsorship
                        workPolicy
                        xLink {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                      }
                      companyId
                      createdAt
                      deletedAt
                      id
                      opportunity {
                        __typename
                        amount {
                          amountMicros
                          currencyCode
                        }
                        closeDate
                        companyId
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        id
                        name
                        pointOfContactId
                        position
                        stage
                        updatedAt
                      }
                      opportunityId
                      person {
                        __typename
                        avatarUrl
                        city
                        companyId
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        emails {
                          primaryEmail
                          additionalEmails
                        }
                        id
                        intro
                        jobTitle
                        linkedinLink {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                        name {
                          firstName
                          lastName
                        }
                        performanceRating
                        phones {
                          primaryPhoneNumber
                          primaryPhoneCountryCode
                          primaryPhoneCallingCode
                          additionalPhones
                        }
                        position
                        updatedAt
                        whatsapp {
                          primaryPhoneNumber
                          primaryPhoneCountryCode
                          primaryPhoneCallingCode
                          additionalPhones
                        }
                        workPreference
                        xLink {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                      }
                      personId
                      pet {
                        __typename
                        age
                        averageCostOfKibblePerMonth {
                          amountMicros
                          currencyCode
                        }
                        bio
                        birthday
                        comments
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        extraData
                        id
                        interestingFacts
                        isGoodWithKids
                        location {
                          addressStreet1
                          addressStreet2
                          addressCity
                          addressState
                          addressCountry
                          addressPostcode
                          addressLat
                          addressLng
                        }
                        makesOwnerThinkOf {
                          firstName
                          lastName
                        }
                        name
                        pictures {
                          primaryLinkUrl
                          primaryLinkLabel
                          secondaryLinks
                        }
                        position
                        soundSwag
                        species
                        traits
                        updatedAt
                        vetEmail {
                          primaryEmail
                          additionalEmails
                        }
                        vetPhone {
                          primaryPhoneNumber
                          primaryPhoneCountryCode
                          primaryPhoneCallingCode
                          additionalPhones
                        }
                      }
                      petId
                      rocket {
                        __typename
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        id
                        name
                        position
                        updatedAt
                      }
                      rocketId
                      surveyResult {
                        __typename
                        averageEstimatedNumberOfAtomsInTheUniverse
                        comments
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        id
                        name
                        participants
                        percentageOfCompletion
                        position
                        score
                        shortNotes
                        updatedAt
                      }
                      surveyResultId
                      task {
                        __typename
                        assigneeId
                        bodyV2 {
                          blocknote
                          markdown
                        }
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                          context
                        }
                        deletedAt
                        dueAt
                        id
                        position
                        status
                        title
                        updatedAt
                      }
                      taskId
                      updatedAt
                    }
                  }
                }
                updatedAt
                whatsapp {
                  primaryPhoneNumber
                  primaryPhoneCountryCode
                  primaryPhoneCallingCode
                  additionalPhones
                }
                workPreference
                xLink {
                  primaryLinkUrl
                  primaryLinkLabel
                  secondaryLinks
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
        }
      `,
      variables: {
        filter: {},
        orderBy: [{ position: 'AscNullsFirst' }],
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
      <ObjectNamePluralSetter>
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: 'instanceId' }}
        >
          <RecordTableComponentInstance
            recordTableId={recordTableId}
            onColumnsChange={onColumnsChange}
          >
            <RecordGroupContext.Provider value={{ recordGroupId: 'default' }}>
              {children}
            </RecordGroupContext.Provider>
          </RecordTableComponentInstance>
        </ViewComponentInstanceContext.Provider>
      </ObjectNamePluralSetter>
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
