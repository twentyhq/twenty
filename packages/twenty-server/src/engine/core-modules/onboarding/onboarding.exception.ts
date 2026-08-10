import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum OnboardingExceptionCode {
  INSTALL_APPS_JOB_ENQUEUE_FAILED = 'INSTALL_APPS_JOB_ENQUEUE_FAILED',
}

const getOnboardingExceptionUserFriendlyMessage = (
  code: OnboardingExceptionCode,
) => {
  switch (code) {
    case OnboardingExceptionCode.INSTALL_APPS_JOB_ENQUEUE_FAILED:
      return msg`Something went wrong while starting the app installation. Please try again.`;
    default:
      assertUnreachable(code);
  }
};

export class OnboardingException extends CustomException<OnboardingExceptionCode> {
  constructor(
    message: string,
    code: OnboardingExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getOnboardingExceptionUserFriendlyMessage(code),
    });
  }
}
