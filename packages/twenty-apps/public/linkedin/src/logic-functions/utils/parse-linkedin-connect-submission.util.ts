import { isString } from '@sniptt/guards';

import { type LinkedinConnectSubmission } from 'src/logic-functions/types/linkedin-connect-submission.type';

const toStringOrUndefined = (value: unknown): string | undefined =>
  isString(value) ? value : undefined;

export const parseLinkedinConnectSubmission = (
  body: object | null,
): LinkedinConnectSubmission => {
  const { flow, action, username, password, code }: Record<string, unknown> = {
    ...body,
  };

  return {
    flow: toStringOrUndefined(flow),
    action: toStringOrUndefined(action),
    username: toStringOrUndefined(username),
    password: toStringOrUndefined(password),
    code: toStringOrUndefined(code),
  };
};
