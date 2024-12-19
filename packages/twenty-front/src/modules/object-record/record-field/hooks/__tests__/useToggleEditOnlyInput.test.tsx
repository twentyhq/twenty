import { gql } from '@apollo/client';
import { MockedResponse } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode, act } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { booleanFieldDefinition } from '@/object-record/record-field/__mocks__/fieldDefinitions';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { useToggleEditOnlyInput } from '@/object-record/record-field/hooks/useToggleEditOnlyInput';
import { generateEmptyJestRecordNode } from '~/testing/jest/generateEmptyJestRecordNode';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const recordId = 'recordId';

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        mutation UpdateOneCompany(
          $idToUpdate: ID!
          $input: CompanyUpdateInput!
        ) {
          updateCompany(id: $idToUpdate, data: $input) {
            __typename
            accountOwner {
              __typename
              avatarUrl
              colorScheme
              createdAt
              dateFormat
              deletedAt
              id
              locale
              name {
                firstName
                lastName
              }
              timeFormat
              timeZone
              updatedAt
              userEmail
              userId
            }
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
            attachments {
              edges {
                node {
                  __typename
                  authorId
                  companyId
                  createdAt
                  deletedAt
                  fullPath
                  id
                  name
                  noteId
                  opportunityId
                  personId
                  rocketId
                  taskId
                  type
                  updatedAt
                }
              }
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
            favorites {
              edges {
                node {
                  __typename
                  companyId
                  createdAt
                  deletedAt
                  favoriteFolderId
                  id
                  noteId
                  opportunityId
                  personId
                  position
                  rocketId
                  taskId
                  updatedAt
                  viewId
                  workflowId
                  workflowRunId
                  workflowVersionId
                  workspaceMemberId
                }
              }
            }
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
            noteTargets {
              edges {
                node {
                  __typename
                  companyId
                  createdAt
                  deletedAt
                  id
                  noteId
                  opportunityId
                  personId
                  rocketId
                  updatedAt
                }
              }
            }
            opportunities {
              edges {
                node {
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
              }
            }
            people {
              edges {
                node {
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
              }
            }
            position
            tagline
            taskTargets {
              edges {
                node {
                  __typename
                  companyId
                  createdAt
                  deletedAt
                  id
                  opportunityId
                  personId
                  rocketId
                  taskId
                  updatedAt
                }
              }
            }
            timelineActivities {
              edges {
                node {
                  __typename
                  companyId
                  createdAt
                  deletedAt
                  happensAt
                  id
                  linkedObjectMetadataId
                  linkedRecordCachedName
                  linkedRecordId
                  name
                  noteId
                  opportunityId
                  personId
                  properties
                  rocketId
                  taskId
                  updatedAt
                  workflowId
                  workflowRunId
                  workflowVersionId
                  workspaceMemberId
                }
              }
            }
            updatedAt
            visaSponsorship
            workPolicy
            xLink {
              primaryLinkUrl
              primaryLinkLabel
              secondaryLinks
            }
          }
        }
      `,
      variables: {
        idToUpdate: 'recordId',
        input: { idealCustomerProfile: true },
      },
    },
    result: jest.fn(() => ({
      data: {
        updateCompany: {
          ...generateEmptyJestRecordNode({
            objectNameSingular: CoreObjectNameSingular.Company,
            input: { id: recordId },
            withDepthOneRelation: true,
          }),
        },
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => {
  const useUpdateOneRecordMutation: RecordUpdateHook = () => {
    const { updateOneRecord } = useUpdateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Company,
    });

    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const JestMetadataAndApolloMocksWrapper =
    getJestMetadataAndApolloMocksWrapper({
      apolloMocks: mocks,
    });

  return (
    <JestMetadataAndApolloMocksWrapper>
      <FieldContext.Provider
        value={{
          fieldDefinition: booleanFieldDefinition,
          recordId,
          hotkeyScope: 'hotkeyScope',
          isLabelIdentifier: false,
          useUpdateRecord: useUpdateOneRecordMutation,
        }}
      >
        {children}
      </FieldContext.Provider>
    </JestMetadataAndApolloMocksWrapper>
  );
};

describe('useToggleEditOnlyInput', () => {
  it('should toggle field', async () => {
    const { result } = renderHook(
      () => ({ toggleField: useToggleEditOnlyInput() }),
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.toggleField();
    });

    await waitFor(() => {
      expect(mocks[0].result).toHaveBeenCalled();
    });
  });
});
