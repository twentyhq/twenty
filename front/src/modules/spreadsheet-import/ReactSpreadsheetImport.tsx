import { ModalWrapper } from './components/core/ModalWrapper';
import { Providers } from './components/core/Providers';
import { Steps } from './components/steps/Steps';
import type { RsiProps } from './types';

export const defaultRSIProps: Partial<RsiProps<any>> = {
  autoMapHeaders: true,
  allowInvalidSubmit: true,
  autoMapDistance: 2,
  uploadStepHook: async (value) => value,
  selectHeaderStepHook: async (headerValues, data) => ({ headerValues, data }),
  matchColumnsStepHook: async (table) => table,
  dateFormat: 'yyyy-mm-dd', // ISO 8601,
  parseRaw: true,
} as const;

export const ReactSpreadsheetImport = <T extends string>(
  props: RsiProps<T>,
) => {
  return (
    <Providers rsiValues={props}>
      <ModalWrapper isOpen={props.isOpen} onClose={props.onClose}>
        <Steps />
      </ModalWrapper>
    </Providers>
  );
};

ReactSpreadsheetImport.defaultProps = defaultRSIProps;
