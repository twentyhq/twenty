import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkspaceCleanerExceptionCode {
  BILLING_SUBSCRIPTION_NOT_FOUND = 'BILLING_SUBSCRIPTION_NOT_FOUND',
}

const getWorkspaceCleanerExceptionUserFriendlyMessage = (
  code: WorkspaceCleanerExceptionCode,
) => {
  switch (code) {
    case WorkspaceCleanerExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND:
      return msg`Billing subscription not found.`;
    default:
      assertUnreachable(code);
  }
};

export class WorkspaceCleanerException extends CustomException<WorkspaceCleanerExceptionCode> {
  constructor(
    message: string,
    code: WorkspaceCleanerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getWorkspaceCleanerExceptionUserFriendlyMessage(code),
    });
  }
}
