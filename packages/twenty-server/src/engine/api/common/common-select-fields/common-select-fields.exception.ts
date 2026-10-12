import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export class CommonSelectFieldsException extends CustomException<'INVALID_FIELD_SELECTION'> {
  constructor(message: string) {
    super(message, 'INVALID_FIELD_SELECTION', {
      userFriendlyMessage: msg`Invalid field selection. Check the requested fields and relation depth.`,
    });
  }
}
