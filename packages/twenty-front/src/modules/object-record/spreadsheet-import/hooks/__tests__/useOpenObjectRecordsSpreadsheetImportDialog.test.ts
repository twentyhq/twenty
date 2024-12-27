import { gql } from '@apollo/client';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useRecoilValue } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';

import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';

import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const companyId = 'cb2e9f4b-20c3-4759-9315-4ffeecfaf71a';

jest.mock('uuid', () => ({
  v4: jest.fn(() => companyId),
}));

const companyMocks = [
  {
    request: {
      query: gql`
        mutation CreateCompanies(
          $data: [CompanyCreateInput!]!
          $upsert: Boolean
        ) {
          createCompanies(data: $data, upsert: $upsert) {
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
        data: [
          {
            createdBy: { source: 'IMPORT' },
            employees: 0,
            idealCustomerProfile: true,
            name: 'Example Company',
            id: companyId,
            visaSponsorship: false,
            deletedAt: undefined,
            workPolicy: [],
          },
        ],
        upsert: true,
      },
    },
    result: jest.fn(() => ({
      data: {
        createCompanies: [
          {
            id: companyId,
            favorites: {
              edges: [],
            },
          },
        ],
      },
    })),
  },
];

const fakeCsv = () => {
  const csvContent = 'name\nExample Company';
  const blob = new Blob([csvContent], { type: 'text/csv' });
  return new File([blob], 'fakeData.csv', { type: 'text/csv' });
};

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: companyMocks,
});

// TODO: improve object metadata item seeds to have more field types to add tests on composite fields here
describe('useSpreadsheetCompanyImport', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const spreadsheetImportDialog = useRecoilValue(
          spreadsheetImportDialogState,
        );
        const {
          openObjectRecordsSpreasheetImportDialog: openRecordSpreadsheetImport,
        } = useOpenObjectRecordsSpreadsheetImportDialog(
          CoreObjectNameSingular.Company,
        );
        return {
          openRecordSpreadsheetImport,
          spreadsheetImportDialog,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    const { spreadsheetImportDialog, openRecordSpreadsheetImport } =
      result.current;

    expect(spreadsheetImportDialog.isOpen).toBe(false);
    expect(spreadsheetImportDialog.options).toBeNull();

    await act(async () => {
      openRecordSpreadsheetImport();
    });

    const { spreadsheetImportDialog: spreadsheetImportDialogAfterOpen } =
      result.current;

    expect(spreadsheetImportDialogAfterOpen.isOpen).toBe(true);
    expect(spreadsheetImportDialogAfterOpen.options).toHaveProperty('onSubmit');
    expect(spreadsheetImportDialogAfterOpen.options?.onSubmit).toBeInstanceOf(
      Function,
    );
    expect(spreadsheetImportDialogAfterOpen.options).toHaveProperty('fields');
    expect(
      Array.isArray(spreadsheetImportDialogAfterOpen.options?.fields),
    ).toBe(true);

    act(() => {
      spreadsheetImportDialogAfterOpen.options?.onSubmit(
        {
          validStructuredRows: [
            {
              id: companyId,
              name: 'Example Company',
              idealCustomerProfile: true,
              employees: '0',
            },
          ],
          invalidStructuredRows: [],
          allStructuredRows: [
            {
              id: companyId,
              name: 'Example Company',
              __index: 'cbc3985f-dde9-46d1-bae2-c124141700ac',
              idealCustomerProfile: true,
              employees: '0',
            },
          ],
        },
        fakeCsv(),
      );
    });

    await waitFor(() => {
      expect(companyMocks[0].result).toHaveBeenCalled();
    });
  });
});
