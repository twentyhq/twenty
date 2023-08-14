import { ModalWrapper } from './components/core/ModalWrapper';
import { Providers } from './components/core/Providers';
import { Steps } from './components/steps/Steps';
import { themeOverrides } from './theme';
import type { RsiProps } from './types';

export const defaultTheme = themeOverrides;

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
    <Providers theme={{}} rsiValues={props}>
      <ModalWrapper isOpen={props.isOpen} onClose={props.onClose}>
        <Steps />
      </ModalWrapper>
    </Providers>
  );
};

ReactSpreadsheetImport.defaultProps = defaultRSIProps;
