import { type MessageDescriptor } from '@lingui/core';

import { RecordCrudExceptionCode } from 'src/engine/core-modules/record-crud/exceptions/record-crud-exception-code.enum';
import { getRecordCrudExceptionUserFriendlyMessage } from 'src/engine/core-modules/record-crud/utils/get-record-crud-exception-user-friendly-message.util';
import { CustomException } from 'src/utils/custom-exception';

export class RecordCrudException extends CustomException<RecordCrudExceptionCode> {
  constructor(
    message: string,
    code: RecordCrudExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getRecordCrudExceptionUserFriendlyMessage(code),
    });
  }
}
