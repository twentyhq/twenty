import type { RsiProps } from '../types';

import { ModalWrapper } from './core/ModalWrapper';
import { Providers } from './core/Providers';
import { Steps } from './steps/Steps';

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

export const SpreadsheetImport = <T extends string>(props: RsiProps<T>) => {
  return (
    <Providers rsiValues={props}>
      <ModalWrapper isOpen={props.isOpen} onClose={props.onClose}>
        <Steps />
      </ModalWrapper>
    </Providers>
  );
};

SpreadsheetImport.defaultProps = defaultRSIProps;
