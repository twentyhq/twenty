import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum FeatureFlagExceptionCode {
  INVALID_FEATURE_FLAG_KEY = 'INVALID_FEATURE_FLAG_KEY',
}

const getFeatureFlagExceptionUserFriendlyMessage = (
  code: FeatureFlagExceptionCode,
) => {
  switch (code) {
    case FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY:
      return msg`Invalid feature flag key.`;
    default:
      assertUnreachable(code);
  }
};

export class FeatureFlagException extends CustomException<FeatureFlagExceptionCode> {
  constructor(
    message: string,
    code: FeatureFlagExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getFeatureFlagExceptionUserFriendlyMessage(code),
    });
  }
}
