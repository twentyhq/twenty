import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { ServerlessFunctionExecutionStatus } from '~/generated-metadata/graphql';

export type ServerlessFunctionTestData = {
  input: { [field: string]: any };
  output: {
    data?: string;
    duration?: number;
    status?: ServerlessFunctionExecutionStatus;
    error?: string;
  };
  language: 'plaintext' | 'json';
  height: number;
};

export const DEFAULT_OUTPUT_VALUE = 'Enter an input above then press "Test"';

export const serverlessFunctionTestDataFamilyState = createFamilyState<
  ServerlessFunctionTestData,
  string
>({
  key: 'serverlessFunctionTestDataFamilyState',
  defaultValue: {
    language: 'plaintext',
    height: 64,
    input: {},
    output: { data: DEFAULT_OUTPUT_VALUE },
  },
});
