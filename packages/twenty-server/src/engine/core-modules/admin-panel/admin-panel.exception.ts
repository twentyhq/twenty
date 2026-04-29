import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const AdminPanelExceptionCode = appendCommonExceptionCode({
  INVALID_MAINTENANCE_MODE_TIME_RANGE: 'INVALID_MAINTENANCE_MODE_TIME_RANGE',
} as const);

const getAdminPanelExceptionUserFriendlyMessage = (
  code: keyof typeof AdminPanelExceptionCode,
) => {
  switch (code) {
    case AdminPanelExceptionCode.INVALID_MAINTENANCE_MODE_TIME_RANGE:
      return msg`Please choose an end date and time after the start date and time.`;
    case AdminPanelExceptionCode.INTERNAL_SERVER_ERROR:
      return msg`Something went wrong. Please try again.`;
    default:
      assertUnreachable(code);
  }
};

export class AdminPanelException extends CustomException<
  keyof typeof AdminPanelExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof AdminPanelExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getAdminPanelExceptionUserFriendlyMessage(code),
    });
  }
}
