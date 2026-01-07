import { isDefined } from 'twenty-shared/utils';

import { type AIChatErrorCodeType } from '@/ai/utils/AIChatErrorCode';
import { extractErrorCode } from '@/ai/utils/extractErrorCode';

export const isAIChatErrorOfType = (
  error: Error | null | undefined,
  errorCode: AIChatErrorCodeType,
): boolean => {
  if (!isDefined(error)) {
    return false;
  }

  return extractErrorCode(error) === errorCode;
};
