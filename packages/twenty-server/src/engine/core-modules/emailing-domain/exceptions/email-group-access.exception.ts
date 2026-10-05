/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export const EmailGroupAccessExceptionCode = appendCommonExceptionCode({
  EMAIL_GROUP_ENTERPRISE_PLAN_REQUIRED: 'EMAIL_GROUP_ENTERPRISE_PLAN_REQUIRED',
} as const);

const emailGroupAccessExceptionUserFriendlyMessages: Record<
  keyof typeof EmailGroupAccessExceptionCode,
  MessageDescriptor
> = {
  EMAIL_GROUP_ENTERPRISE_PLAN_REQUIRED: msg`Email group requires an Enterprise plan.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
};
const EMAIL_GROUP_ACCESS_EXCEPTION_CATEGORY_BY_CODE = {
  [EmailGroupAccessExceptionCode.INTERNAL_SERVER_ERROR]:
    'INTERNAL_SERVER_ERROR',
  [EmailGroupAccessExceptionCode.EMAIL_GROUP_ENTERPRISE_PLAN_REQUIRED]:
    'FORBIDDEN',
} as const satisfies Record<
  keyof typeof EmailGroupAccessExceptionCode,
  ExceptionCategory
>;

export class EmailGroupAccessException extends CustomException<
  keyof typeof EmailGroupAccessExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof EmailGroupAccessExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        emailGroupAccessExceptionUserFriendlyMessages[code],
      category: EMAIL_GROUP_ACCESS_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
