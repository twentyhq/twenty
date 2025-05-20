import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { SpreadSheetImportModalWrapper } from '@/spreadsheet-import/components/SpreadSheetImportModalWrapper';
import { SPREADSHEET_IMPORT_MODAL_ID } from '@/spreadsheet-import/constants/SpreadsheetImportModalId';
import { SpreadsheetImportStepperContainer } from '@/spreadsheet-import/steps/components/SpreadsheetImportStepperContainer';
import { SpreadsheetImportDialogOptions as SpreadsheetImportProps } from '@/spreadsheet-import/types';

export const defaultSpreadsheetImportProps: Partial<
  SpreadsheetImportProps<any>
> = {
  autoMapHeaders: true,
  allowInvalidSubmit: true,
  autoMapDistance: 2,
  uploadStepHook: async (value) => value,
  selectHeaderStepHook: async (headerValues, data) => ({
    headerRow: headerValues,
    importedRows: data,
  }),
  matchColumnsStepHook: async (table) => table,
  dateFormat: 'yyyy-mm-dd', // ISO 8601,
  parseRaw: true,
  selectHeader: false,
  maxRecords: 2000,
} as const;

export const SpreadsheetImport = <T extends string>(
  props: SpreadsheetImportProps<T>,
) => {
  const mergedProps = {
    ...defaultSpreadsheetImportProps,
    ...props,
  } as SpreadsheetImportProps<T>;

  return (
    <ReactSpreadsheetImportContextProvider values={mergedProps}>
      <SpreadSheetImportModalWrapper
        modalId={SPREADSHEET_IMPORT_MODAL_ID}
        onClose={mergedProps.onClose}
      >
        <SpreadsheetImportStepperContainer />
      </SpreadSheetImportModalWrapper>
    </ReactSpreadsheetImportContextProvider>
  );
};
