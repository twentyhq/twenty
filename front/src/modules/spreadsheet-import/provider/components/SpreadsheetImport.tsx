import { ModalWrapper } from '@/spreadsheet-import/components/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/Providers';
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

export const SpreadsheetImport = <T extends string>(
  props: SpreadsheetOptions<T>,
) => {
  return (
    <Providers values={props}>
      <ModalWrapper isOpen={props.isOpen} onClose={props.onClose}>
        <Steps />
      </ModalWrapper>
    </Providers>
  );
};

SpreadsheetImport.defaultProps = defaultSpreadsheetImportProps;
