import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceApiNamingException extends CustomException<'INVALID_API_NAMING_VIEW'> {
  constructor(message: string) {
    super(message, 'INVALID_API_NAMING_VIEW', {
      userFriendlyMessage: msg`The API naming configuration is invalid.`,
    });
  }
}
