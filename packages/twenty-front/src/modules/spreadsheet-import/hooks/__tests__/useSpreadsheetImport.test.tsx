import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import React, { act } from 'react';

import { useOpenSpreadsheetImportDialog } from '@/spreadsheet-import/hooks/useOpenSpreadsheetImportDialog';
import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import {
  type ImportedRow,
  type SpreadsheetImportDialogOptions,
} from '@/spreadsheet-import/types';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
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
      }),
      {
        wrapper: Wrapper,
      },
    );
    expect(jotaiStore.get(spreadsheetImportDialogState.atom)).toStrictEqual({
      isOpen: false,
      isStepBarVisible: true,
      options: null,
    });
    act(() => {
      result.current.useSpreadsheetImport.openSpreadsheetImportDialog(
        mockedSpreadsheetOptions,
      );
    });
    expect(jotaiStore.get(spreadsheetImportDialogState.atom)).toStrictEqual({
      isOpen: true,
      isStepBarVisible: true,
      options: mockedSpreadsheetOptions,
    });
  });
});
