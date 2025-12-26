import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum SearchExceptionCode {
  LABEL_IDENTIFIER_FIELD_NOT_FOUND = 'LABEL_IDENTIFIER_FIELD_NOT_FOUND',
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
}

const searchExceptionUserFriendlyMessages: Record<
  SearchExceptionCode,
  MessageDescriptor
> = {
  [SearchExceptionCode.LABEL_IDENTIFIER_FIELD_NOT_FOUND]: msg`Label identifier field not found.`,
  [SearchExceptionCode.OBJECT_METADATA_NOT_FOUND]: msg`Object not found.`,
};

export class SearchException extends CustomException<SearchExceptionCode> {
  constructor(
    message: string,
    code: SearchExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? searchExceptionUserFriendlyMessages[code],
    });
  }
}
