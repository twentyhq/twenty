import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

import { useOpenObjectRecordsSpreasheetImportDialog } from '../useSpreadsheetRecordImport';

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
            xLink {
              label
              url
            }
            linkedinLink {
              label
              url
            }
            domainName
            annualRecurringRevenue {
              amountMicros
              currencyCode
            }
            createdAt
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
            updatedAt
            name
            accountOwnerId
            employees
            id
            idealCustomerProfile
          }
        }
      `,
      variables: {
        data: [
          {
            address: 'test',
            domainName: 'example.com',
            employees: 0,
            idealCustomerProfile: true,
            name: 'Example Company',
            id: companyId,
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
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        {children}
      </SnackBarProviderScope>
    </MockedProvider>
  </RecoilRoot>
);

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
              domainName: 'example.com',
              idealCustomerProfile: true,
              address: 'test',
              employees: '0',
            },
          ],
          invalidStructuredRows: [],
          allStructuredRows: [
            {
              id: companyId,
              name: 'Example Company',
              domainName: 'example.com',
              __index: 'cbc3985f-dde9-46d1-bae2-c124141700ac',
              idealCustomerProfile: true,
              address: 'test',
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
