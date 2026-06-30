import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { LogicFunctionExecutionStatus } from '~/generated-metadata/graphql';

export type LogicFunctionTestData = {
  input: { [field: string]: any };
  shouldInitInput: boolean;
  output: {
    data?: string;
    logs: string;
    duration?: number;
    status?: LogicFunctionExecutionStatus;
    error?: string;
  };
  language: 'plaintext' | 'json';
};

export const DEFAULT_OUTPUT_VALUE = {
  data: 'Enter an input above then press "Test"',
  logs: '',
  status: LogicFunctionExecutionStatus.IDLE,
};

export const logicFunctionTestDataFamilyState = createAtomFamilyState<
  LogicFunctionTestData,
  string
>({
  key: 'logicFunctionTestDataFamilyState',
  defaultValue: {
    language: 'plaintext',
    input: {},
    shouldInitInput: true,
    output: DEFAULT_OUTPUT_VALUE,
  },
});
