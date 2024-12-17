import { ServerlessFunctionExecutionStatus } from '~/generated-metadata/graphql';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

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

export const DEFAULT_OUTPUT_VALUE =
  'Enter an input above then press "run Function"';

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
