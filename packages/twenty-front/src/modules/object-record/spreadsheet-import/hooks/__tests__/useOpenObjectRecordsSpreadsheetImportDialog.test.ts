import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useRecoilValue } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';

import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';

import gql from 'graphql-tag';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockBatchCreateManyRecords = jest.fn().mockResolvedValue([]);

jest.mock('@/object-record/hooks/useBatchCreateManyRecords', () => ({
  useBatchCreateManyRecords: () => ({
    batchCreateManyRecords: mockBatchCreateManyRecords,
  }),
}));

const companyId = 'cb2e9f4b-20c3-4759-9315-4ffeecfaf71a';

jest.mock('uuid', () => ({
  v4: jest.fn(() => companyId),
}));

const mockResult = jest.fn(() => ({
  data: {
    createCompanies: [
      {
        id: companyId,
        name: 'Example Company',
        employees: 0,
        idealCustomerProfile: true,
        __typename: 'Company',
      },
    ],
  },
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
            id
            name
            employees
            idealCustomerProfile
            __typename
          }
        }
      `,
    },
    variableMatcher: () => true,
    result: mockResult,
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

describe('useOpenObjectRecordsSpreadsheetImportDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open dialog and configure onSubmit function correctly', async () => {
    const { result } = renderHook(
      () => {
        const spreadsheetImportDialog = useRecoilValue(
          spreadsheetImportDialogState,
        );
        const { openObjectRecordsSpreadsheetImportDialog } =
          useOpenObjectRecordsSpreadsheetImportDialog(
            CoreObjectNameSingular.Company,
          );
        return {
          openObjectRecordsSpreadsheetImportDialog,
          spreadsheetImportDialog,
        };
      },
      { wrapper: Wrapper },
    );

    const {
      spreadsheetImportDialog,
      openObjectRecordsSpreadsheetImportDialog,
    } = result.current;

    expect(spreadsheetImportDialog.isOpen).toBe(false);
    expect(spreadsheetImportDialog.options).toBeNull();

    await act(async () => {
      openObjectRecordsSpreadsheetImportDialog();
    });

    const { spreadsheetImportDialog: dialogAfterOpen } = result.current;

    expect(dialogAfterOpen.isOpen).toBe(true);
    expect(dialogAfterOpen.options).toHaveProperty('onSubmit');
    expect(dialogAfterOpen.options?.onSubmit).toBeInstanceOf(Function);
    expect(dialogAfterOpen.options).toHaveProperty('spreadsheetImportFields');
    expect(
      Array.isArray(dialogAfterOpen.options?.spreadsheetImportFields),
    ).toBe(true);
  });

  it('should call batchCreateManyRecords when onSubmit is executed', async () => {
    const { result } = renderHook(
      () => {
        const spreadsheetImportDialog = useRecoilValue(
          spreadsheetImportDialogState,
        );
        const { openObjectRecordsSpreadsheetImportDialog } =
          useOpenObjectRecordsSpreadsheetImportDialog(
            CoreObjectNameSingular.Company,
          );
        return {
          openObjectRecordsSpreadsheetImportDialog,
          spreadsheetImportDialog,
        };
      },
      { wrapper: Wrapper },
    );

    await act(async () => {
      result.current.openObjectRecordsSpreadsheetImportDialog();
    });

    const { spreadsheetImportDialog } = result.current;

    const submitData = {
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
    };

    await act(async () => {
      await spreadsheetImportDialog.options?.onSubmit(submitData, fakeCsv());
    });

    expect(mockBatchCreateManyRecords).toHaveBeenCalledTimes(1);

    const callArgs = mockBatchCreateManyRecords.mock.calls[0][0];
    expect(callArgs).toHaveProperty('recordsToCreate');
    expect(callArgs).toHaveProperty('upsert', true);
    expect(Array.isArray(callArgs.recordsToCreate)).toBe(true);
    expect(callArgs.recordsToCreate).toHaveLength(1);

    const recordToCreate = callArgs.recordsToCreate[0];
    expect(recordToCreate).toHaveProperty('name', 'Example Company');
    expect(recordToCreate).toHaveProperty('idealCustomerProfile', true);
    expect(recordToCreate).toHaveProperty('employees', 0);
  });
});
