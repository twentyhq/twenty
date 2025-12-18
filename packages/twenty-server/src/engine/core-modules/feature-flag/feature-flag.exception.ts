import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum FeatureFlagExceptionCode {
  INVALID_FEATURE_FLAG_KEY = 'INVALID_FEATURE_FLAG_KEY',
}

const featureFlagExceptionUserFriendlyMessages: Record<
  FeatureFlagExceptionCode,
  MessageDescriptor
> = {
  [FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY]: msg`Invalid feature flag key.`,
};

export class FeatureFlagException extends CustomException<FeatureFlagExceptionCode> {
  constructor(
    message: string,
    code: FeatureFlagExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? featureFlagExceptionUserFriendlyMessages[code],
    });
  }
}
