import { useRecoilValue } from 'recoil';

import { ModalWrapper } from '@/spreadsheet-import/components/ModalWrapper';
import { useSpreadsheetImport } from '@/spreadsheet-import/hooks/useSpreadsheetImport';
import { spreadsheetImportState } from '@/spreadsheet-import/states/spreadsheetImportState';
import { Steps } from '@/spreadsheet-import/steps/components/Steps';
import type { SpreadsheetOptions } from '@/spreadsheet-import/types';

export const defaultSpreadsheetImportProps: Partial<SpreadsheetOptions<any>> = {
  autoMapHeaders: true,
  allowInvalidSubmit: true,
  autoMapDistance: 2,
  uploadStepHook: async (value) => value,
  selectHeaderStepHook: async (headerValues, data) => ({ headerValues, data }),
  matchColumnsStepHook: async (table) => table,
  dateFormat: 'yyyy-mm-dd', // ISO 8601,
  parseRaw: true,
} as const;

export const SpreadsheetImport = () => {
  const { isOpen } = useRecoilValue(spreadsheetImportState);
  const { closeSpreadsheetImport } = useSpreadsheetImport();

  return (
    <ModalWrapper isOpen={isOpen} onClose={closeSpreadsheetImport}>
      <Steps />
    </ModalWrapper>
  );
};

SpreadsheetImport.defaultProps = defaultSpreadsheetImportProps;
