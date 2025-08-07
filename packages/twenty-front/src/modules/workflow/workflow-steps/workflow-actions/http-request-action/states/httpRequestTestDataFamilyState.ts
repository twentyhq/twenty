import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { HTTP_REQUEST_CONSTANTS } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
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
    output: HTTP_REQUEST_CONSTANTS.DEFAULT_OUTPUT_VALUE,
  },
});
