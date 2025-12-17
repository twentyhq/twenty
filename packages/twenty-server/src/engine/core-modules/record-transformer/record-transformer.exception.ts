import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum RecordTransformerExceptionCode {
  INVALID_URL = 'INVALID_URL',
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
  INVALID_PHONE_COUNTRY_CODE = 'INVALID_PHONE_COUNTRY_CODE',
  INVALID_PHONE_CALLING_CODE = 'INVALID_PHONE_CALLING_CODE',
  CONFLICTING_PHONE_COUNTRY_CODE = 'CONFLICTING_PHONE_COUNTRY_CODE',
  CONFLICTING_PHONE_CALLING_CODE = 'CONFLICTING_PHONE_CALLING_CODE',
  CONFLICTING_PHONE_CALLING_CODE_AND_COUNTRY_CODE = 'CONFLICTING_PHONE_CALLING_CODE_AND_COUNTRY_CODE',
}

const recordTransformerExceptionUserFriendlyMessages: Record<
  RecordTransformerExceptionCode,
  MessageDescriptor
> = {
  [RecordTransformerExceptionCode.INVALID_URL]: msg`Invalid URL format.`,
  [RecordTransformerExceptionCode.INVALID_PHONE_NUMBER]: msg`Invalid phone number.`,
  [RecordTransformerExceptionCode.INVALID_PHONE_COUNTRY_CODE]: msg`Invalid phone country code.`,
  [RecordTransformerExceptionCode.INVALID_PHONE_CALLING_CODE]: msg`Invalid phone calling code.`,
  [RecordTransformerExceptionCode.CONFLICTING_PHONE_COUNTRY_CODE]: msg`Conflicting phone country code.`,
  [RecordTransformerExceptionCode.CONFLICTING_PHONE_CALLING_CODE]: msg`Conflicting phone calling code.`,
  [RecordTransformerExceptionCode.CONFLICTING_PHONE_CALLING_CODE_AND_COUNTRY_CODE]: msg`Conflicting phone calling code and country code.`,
};

export class RecordTransformerException extends CustomException<RecordTransformerExceptionCode> {
  constructor(
    message: string,
    code: RecordTransformerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        recordTransformerExceptionUserFriendlyMessages[code],
    });
  }
}
