import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { DEFAULT_HTTP_REQUEST_OUTPUT_VALUE } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { type HttpRequestTestData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/types/HttpRequestTestData';

export const httpRequestTestDataFamilyState = createFamilyState<
  HttpRequestTestData,
  string
>({
  key: 'httpRequestTestDataFamilyState',
  defaultValue: {
    language: 'plaintext',
    height: 400,
    variableValues: {},
    output: DEFAULT_HTTP_REQUEST_OUTPUT_VALUE,
  },
});
