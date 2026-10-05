import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

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
const SEARCH_EXCEPTION_CATEGORY_BY_CODE = {
  [SearchExceptionCode.LABEL_IDENTIFIER_FIELD_NOT_FOUND]:
    'INTERNAL_SERVER_ERROR',
  [SearchExceptionCode.OBJECT_METADATA_NOT_FOUND]: 'INTERNAL_SERVER_ERROR',
} as const satisfies Record<SearchExceptionCode, ExceptionCategory>;

export class SearchException extends CustomException<SearchExceptionCode> {
  constructor(
    message: string,
    code: SearchExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getSearchExceptionUserFriendlyMessage(code),
      category: SEARCH_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
