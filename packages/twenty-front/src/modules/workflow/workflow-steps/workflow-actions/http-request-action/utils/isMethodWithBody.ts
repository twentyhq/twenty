import {
  type HttpMethodWithBody,
  HTTP_REQUEST_CONSTANTS,
} from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';

export const isMethodWithBody = (
  method: string | null,
): method is HttpMethodWithBody => {
  if (!method) {
    return false;
  }

  return HTTP_REQUEST_CONSTANTS.METHODS_WITH_BODY.includes(method as HttpMethodWithBody);
};
