import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { ServerlessFunctionExecutionStatus } from '~/generated-metadata/graphql';

export type ServerlessFunctionTestData = {
  input: Record<string, unknown>;
  shouldInitInput: boolean;
  output: {
    data?: string;
    logs: string;
    duration?: number;
    status?: ServerlessFunctionExecutionStatus;
    error?: string;
  };
  language: 'plaintext' | 'json';
  height: number;
};

export const DEFAULT_OUTPUT_VALUE = {
  data: 'Enter an input above then press "Test"',
  logs: '',
  status: ServerlessFunctionExecutionStatus.IDLE,
};

export const serverlessFunctionTestDataFamilyState = createFamilyState<
  ServerlessFunctionTestData,
  string
>({
  key: 'serverlessFunctionTestDataFamilyState',
  defaultValue: {
    language: 'plaintext',
    height: 64,
    input: {},
    shouldInitInput: true,
    output: DEFAULT_OUTPUT_VALUE,
  },
});
