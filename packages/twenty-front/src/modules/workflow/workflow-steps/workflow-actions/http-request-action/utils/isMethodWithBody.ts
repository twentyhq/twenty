import { METHODS_WITH_BODY } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';

export const isMethodWithBody = (method: string | null): boolean => {
  if (!method) {
    return false;
  }

  return METHODS_WITH_BODY.includes(
    method as (typeof METHODS_WITH_BODY)[number],
  );
};
