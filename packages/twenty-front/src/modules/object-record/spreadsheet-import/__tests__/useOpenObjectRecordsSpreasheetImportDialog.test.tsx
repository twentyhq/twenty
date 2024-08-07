import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';

import { SnackBarManagerScopeInternalContext } from '@/ui/feedback/snack-bar-manager/scopes/scope-internal-context/SnackBarManagerScopeInternalContext';
import { useOpenObjectRecordsSpreasheetImportDialog } from '../hooks/useOpenObjectRecordsSpreasheetImportDialog';

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
            id
            visaSponsorship
            createdBy {
              source
              workspaceMemberId
              name
            }
            domainName {
              primaryLinkUrl
              primaryLinkLabel
              secondaryLinks
            }
            introVideo {
              primaryLinkUrl
              primaryLinkLabel
              secondaryLinks
            }
            position
            annualRecurringRevenue {
              amountMicros
              currencyCode
            }
            employees
            linkedinLink {
              primaryLinkUrl
              primaryLinkLabel
              secondaryLinks
            }
            workPolicy
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
            name
            updatedAt
            xLink {
              primaryLinkUrl
              primaryLinkLabel
              secondaryLinks
            }
            myCustomField
            createdAt
            accountOwnerId
            tagline
            idealCustomerProfile
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

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={companyMocks} addTypename={false}>
      <SnackBarManagerScopeInternalContext.Provider
        value={{ scopeId: 'snack-bar-manager' }}
      >
        {children}
      </SnackBarManagerScopeInternalContext.Provider>
    </MockedProvider>
  </RecoilRoot>
);

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
        } = useOpenObjectRecordsSpreasheetImportDialog(
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
