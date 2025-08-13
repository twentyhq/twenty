import { renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilState } from 'recoil';

import { useOpenSpreadsheetImportDialog } from '@/spreadsheet-import/hooks/useOpenSpreadsheetImportDialog';
import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import {
  type ImportedRow,
  type SpreadsheetImportDialogOptions,
} from '@/spreadsheet-import/types';
import { act } from 'react';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

export const mockedSpreadsheetOptions: SpreadsheetImportDialogOptions = {
  onClose: () => {},
  spreadsheetImportFields: [],
  uploadStepHook: async () => [],
  selectHeaderStepHook: async (
    headerValues: ImportedRow,
    data: ImportedRow[],
  ) => ({
    headerRow: headerValues,
    importedRows: data,
  }),
  matchColumnsStepHook: async () => [],
  rowHook: () => ({ spreadsheet_key: 'rowHook' }),
  tableHook: () => [{ spreadsheet_key: 'tableHook' }],
  onSubmit: async () => {},
  allowInvalidSubmit: false,
  customTheme: {},
  maxRecords: 10,
  maxFileSize: 50,
  autoMapHeaders: true,
  autoMapDistance: 1,
  initialStepState: {
    type: SpreadsheetImportStepType.upload,
  },
  dateFormat: 'MM/DD/YY',
  parseRaw: true,
  rtl: false,
  selectHeader: true,
  availableFieldMetadataItems: [],
};

describe('useSpreadsheetImport', () => {
  it('should set isOpen to true, and update the options in the Recoil state', async () => {
    const { result } = renderHook(
      () => ({
        useSpreadsheetImport: useOpenSpreadsheetImportDialog(),
        spreadsheetImportState: useRecoilState(spreadsheetImportDialogState)[0],
      }),
      {
        wrapper: Wrapper,
      },
    );
    expect(result.current.spreadsheetImportState).toStrictEqual({
      isOpen: false,
      isStepBarVisible: true,
      options: null,
    });
    act(() => {
      result.current.useSpreadsheetImport.openSpreadsheetImportDialog(
        mockedSpreadsheetOptions,
      );
    });
    expect(result.current.spreadsheetImportState).toStrictEqual({
      isOpen: true,
      isStepBarVisible: true,
      options: mockedSpreadsheetOptions,
    });
  });
});
