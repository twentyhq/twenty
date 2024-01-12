import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { spreadsheetImportState } from '@/spreadsheet-import/states/spreadsheetImportState';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

import {
  personId,
  query,
  responseData,
  variables,
} from '../__mocks__/useSpreadsheetPersonImport';
import { useSpreadsheetPersonImport } from '../useSpreadsheetPersonImport';

jest.mock('uuid', () => ({
  v4: jest.fn(() => personId),
}));

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        createPeople: responseData,
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        {children}
      </SnackBarProviderScope>
    </MockedProvider>
  </RecoilRoot>
);

const fakeCsv = () => {
  const csvContent = 'firstname, lastname\nSheldon, Cooper';
  const blob = new Blob([csvContent], { type: 'text/csv' });
  return new File([blob], 'fakeData.csv', { type: 'text/csv' });
};

describe('useSpreadsheetPersonImport', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const spreadsheetImport = useRecoilValue(spreadsheetImportState);
        const { openPersonSpreadsheetImport } = useSpreadsheetPersonImport();
        return { openPersonSpreadsheetImport, spreadsheetImport };
      },
      {
        wrapper: Wrapper,
      },
    );

    const { spreadsheetImport, openPersonSpreadsheetImport } = result.current;

    expect(spreadsheetImport.isOpen).toBe(false);
    expect(spreadsheetImport.options).toBeNull();

    await act(async () => {
      openPersonSpreadsheetImport();
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
              firstName: 'Sheldon',
              lastName: ' Cooper',
            },
          ],
          invalidData: [],
          all: [
            {
              firstName: 'Sheldon',
              lastName: ' Cooper',
              __index: 'cbc3985f-dde9-46d1-bae2-c124141700ac',
            },
          ],
        },
        fakeCsv(),
      );
    });

    await waitFor(() => {
      expect(mocks[0].result).toHaveBeenCalled();
    });
  });
});
