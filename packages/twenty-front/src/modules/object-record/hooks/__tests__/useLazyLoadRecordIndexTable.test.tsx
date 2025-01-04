import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { ReactNode, act } from 'react';

import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { useLazyLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLazyLoadRecordIndexTable';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { MockedResponse } from '@apollo/client/testing';
import gql from 'graphql-tag';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getPeopleMock } from '~/testing/mock-data/people';

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
                        body
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
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
                      rocket {
                        __typename
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                        }
                        deletedAt
                        id
                        name
                        position
                        updatedAt
                      }
                      rocketId
                      updatedAt
                    }
                  }
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
                      rocket {
                        __typename
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
                        }
                        deletedAt
                        id
                        name
                        position
                        updatedAt
                      }
                      rocketId
                      task {
                        __typename
                        assigneeId
                        body
                        createdAt
                        createdBy {
                          source
                          workspaceMemberId
                          name
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
        people: getPeopleMock(),
      },
    })),
  },
];

const HookMockWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

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

describe('useLazyLoadRecordIndexTable', () => {
  it('should fetch', async () => {
    const { result } = renderHook(
      () => {
        const { findManyRecords, ...result } =
          useLazyLoadRecordIndexTable(objectNameSingular);

        return {
          findManyRecords,
          ...result,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.findManyRecords();
    });

    expect(Array.isArray(result.current.records)).toBe(true);
    expect(result.current.records.length).toBe(13);
  });
});
