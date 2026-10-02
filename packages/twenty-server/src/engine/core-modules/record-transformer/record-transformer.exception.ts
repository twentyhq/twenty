import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum RecordTransformerExceptionCode {
  INVALID_URL = 'INVALID_URL',
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',
  INVALID_PHONE_COUNTRY_CODE = 'INVALID_PHONE_COUNTRY_CODE',
  INVALID_PHONE_CALLING_CODE = 'INVALID_PHONE_CALLING_CODE',
  CONFLICTING_PHONE_COUNTRY_CODE = 'CONFLICTING_PHONE_COUNTRY_CODE',
  CONFLICTING_PHONE_CALLING_CODE = 'CONFLICTING_PHONE_CALLING_CODE',
  CONFLICTING_PHONE_CALLING_CODE_AND_COUNTRY_CODE = 'CONFLICTING_PHONE_CALLING_CODE_AND_COUNTRY_CODE',
  RICH_TEXT_CONTENT_NOT_SUPPORTED_IN_BATCH = 'RICH_TEXT_CONTENT_NOT_SUPPORTED_IN_BATCH',
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
    case RecordTransformerExceptionCode.RICH_TEXT_CONTENT_NOT_SUPPORTED_IN_BATCH:
      return msg`This rich text can only be written one record at a time. HTML, tables, images, multi-paragraph quotes and code blocks without a language are not supported in batches.`;
    default:
      assertUnreachable(code);
  }
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
        getRecordTransformerExceptionUserFriendlyMessage(code),
    });
  }
}
