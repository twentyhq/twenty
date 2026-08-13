import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum OnboardingExceptionCode {
  NO_PREVIOUS_ONBOARDING_STEP = 'NO_PREVIOUS_ONBOARDING_STEP',
  MISSING_TRANSACTION_QUERY_RUNNER = 'MISSING_TRANSACTION_QUERY_RUNNER',
  INSTALL_APPS_JOB_ENQUEUE_FAILED = 'INSTALL_APPS_JOB_ENQUEUE_FAILED',
}

const getOnboardingExceptionUserFriendlyMessage = (
  code: OnboardingExceptionCode,
) => {
  switch (code) {
    case OnboardingExceptionCode.NO_PREVIOUS_ONBOARDING_STEP:
      return msg`There is no previous onboarding step to go back to.`;
    case OnboardingExceptionCode.MISSING_TRANSACTION_QUERY_RUNNER:
      return msg`Something went wrong while saving your onboarding progress.`;
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
