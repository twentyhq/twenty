import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum OnboardingExceptionCode {
  NO_PREVIOUS_ONBOARDING_STEP = 'NO_PREVIOUS_ONBOARDING_STEP',
}

const getOnboardingExceptionUserFriendlyMessage = (
  code: OnboardingExceptionCode,
) => {
  switch (code) {
    case OnboardingExceptionCode.NO_PREVIOUS_ONBOARDING_STEP:
      return msg`There is no previous onboarding step to go back to.`;
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
