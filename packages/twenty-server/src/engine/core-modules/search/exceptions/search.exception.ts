import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum SearchExceptionCode {
  LABEL_IDENTIFIER_FIELD_NOT_FOUND = 'LABEL_IDENTIFIER_FIELD_NOT_FOUND',
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
}

const getSearchExceptionUserFriendlyMessage = (code: SearchExceptionCode) => {
  switch (code) {
    case SearchExceptionCode.LABEL_IDENTIFIER_FIELD_NOT_FOUND:
      return msg`No identifier to search by was found.`;
    case SearchExceptionCode.OBJECT_METADATA_NOT_FOUND:
      return msg`Object not found.`;
    default:
      assertUnreachable(code);
  }
};

export class SearchException extends CustomException<SearchExceptionCode> {
  constructor(
    message: string,
    code: SearchExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getSearchExceptionUserFriendlyMessage(code),
    });
  }
}
