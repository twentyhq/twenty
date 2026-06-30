import {
  type HttpMethodWithBody,
  METHODS_WITH_BODY,
} from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';

export const isMethodWithBody = (
  method: string | null,
): method is HttpMethodWithBody => {
  if (!method) {
    return false;
  }

  return METHODS_WITH_BODY.includes(method as HttpMethodWithBody);
};
