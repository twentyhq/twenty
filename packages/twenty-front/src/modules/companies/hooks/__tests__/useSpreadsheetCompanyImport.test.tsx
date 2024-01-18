import { ReactNode } from 'react';
import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { spreadsheetImportState } from '@/spreadsheet-import/states/spreadsheetImportState';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

import { useSpreadsheetCompanyImport } from '../useSpreadsheetCompanyImport';

const companyId = 'cb2e9f4b-20c3-4759-9315-4ffeecfaf71a';

jest.mock('uuid', () => ({
  v4: jest.fn(() => companyId),
}));

jest.mock('@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery', () => ({
  useMapFieldMetadataToGraphQLQuery: () => () => '\n',
}));

const companyMocks = [
  {
    request: {
      query: gql`
        mutation CreateCompanies($data: [CompanyCreateInput!]!) {
          createCompanies(data: $data) {
            id
          }
        }
      `,
      variables: {
        data: [
          {
            name: 'Example Company',
            domainName: 'example.com',
            idealCustomerProfile: true,
            address: undefined,
            employees: undefined,
            id: companyId,
          },
        ],
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
        const spreadsheetImport = useRecoilValue(spreadsheetImportState);
        const { openCompanySpreadsheetImport } = useSpreadsheetCompanyImport();
        return { openCompanySpreadsheetImport, spreadsheetImport };
      },
      {
        wrapper: Wrapper,
      },
    );

    const { spreadsheetImport, openCompanySpreadsheetImport } = result.current;

    expect(spreadsheetImport.isOpen).toBe(false);
    expect(spreadsheetImport.options).toBeNull();

    await act(async () => {
      openCompanySpreadsheetImport();
    });

    const { spreadsheetImport: updatedImport } = result.current;

    expect(updatedImport.isOpen).toBe(true);
    expect(updatedImport.options).toHaveProperty('onSubmit');
    expect(updatedImport.options?.onSubmit).toBeInstanceOf(Function);
    expect(updatedImport.options).toHaveProperty('fields');
    expect(Array.isArray(updatedImport.options?.fields)).toBe(true);

    act(() => {
      updatedImport.options?.onSubmit(
        {
          validData: [
            {
              id: companyId,
              name: 'Example Company',
              domainName: 'example.com',
              idealCustomerProfile: true,
              address: undefined,
              employees: undefined,
            },
          ],
          invalidData: [],
          all: [
            {
              id: companyId,
              name: 'Example Company',
              domainName: 'example.com',
              __index: 'cbc3985f-dde9-46d1-bae2-c124141700ac',
              idealCustomerProfile: true,
              address: undefined,
              employees: undefined,
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
