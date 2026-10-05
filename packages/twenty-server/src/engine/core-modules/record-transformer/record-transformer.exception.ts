import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum RecordTransformerExceptionCode {
  INVALID_URL = 'INVALID_URL',
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
  INVALID_PHONE_COUNTRY_CODE = 'INVALID_PHONE_COUNTRY_CODE',
  INVALID_PHONE_CALLING_CODE = 'INVALID_PHONE_CALLING_CODE',
  CONFLICTING_PHONE_COUNTRY_CODE = 'CONFLICTING_PHONE_COUNTRY_CODE',
  CONFLICTING_PHONE_CALLING_CODE = 'CONFLICTING_PHONE_CALLING_CODE',
  CONFLICTING_PHONE_CALLING_CODE_AND_COUNTRY_CODE = 'CONFLICTING_PHONE_CALLING_CODE_AND_COUNTRY_CODE',
}

const getRecordTransformerExceptionUserFriendlyMessage = (
  code: RecordTransformerExceptionCode,
) => {
  switch (code) {
    case RecordTransformerExceptionCode.INVALID_URL:
      return msg`Invalid URL format.`;
    case RecordTransformerExceptionCode.INVALID_PHONE_NUMBER:
      return msg`Invalid phone number.`;
    case RecordTransformerExceptionCode.INVALID_PHONE_COUNTRY_CODE:
      return msg`Invalid phone country code.`;
    case RecordTransformerExceptionCode.INVALID_PHONE_CALLING_CODE:
      return msg`Invalid phone calling code.`;
    case RecordTransformerExceptionCode.CONFLICTING_PHONE_COUNTRY_CODE:
      return msg`Conflicting phone country code.`;
    case RecordTransformerExceptionCode.CONFLICTING_PHONE_CALLING_CODE:
      return msg`Conflicting phone calling code.`;
    case RecordTransformerExceptionCode.CONFLICTING_PHONE_CALLING_CODE_AND_COUNTRY_CODE:
      return msg`Conflicting phone calling code and country code.`;
    default:
      assertUnreachable(code);
  }
};
const RECORD_TRANSFORMER_EXCEPTION_CATEGORY_BY_CODE = {
  [RecordTransformerExceptionCode.INVALID_URL]: 'BAD_USER_INPUT',
  [RecordTransformerExceptionCode.INVALID_PHONE_NUMBER]: 'BAD_USER_INPUT',
  [RecordTransformerExceptionCode.INVALID_PHONE_COUNTRY_CODE]: 'BAD_USER_INPUT',
  [RecordTransformerExceptionCode.INVALID_PHONE_CALLING_CODE]: 'BAD_USER_INPUT',
  [RecordTransformerExceptionCode.CONFLICTING_PHONE_COUNTRY_CODE]:
    'BAD_USER_INPUT',
  [RecordTransformerExceptionCode.CONFLICTING_PHONE_CALLING_CODE]:
    'BAD_USER_INPUT',
  [RecordTransformerExceptionCode.CONFLICTING_PHONE_CALLING_CODE_AND_COUNTRY_CODE]:
    'BAD_USER_INPUT',
} as const satisfies Record<RecordTransformerExceptionCode, ExceptionCategory>;

export class RecordTransformerException extends CustomException<RecordTransformerExceptionCode> {
  constructor(
    message: string,
    code: RecordTransformerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getRecordTransformerExceptionUserFriendlyMessage(code),
      category: RECORD_TRANSFORMER_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
