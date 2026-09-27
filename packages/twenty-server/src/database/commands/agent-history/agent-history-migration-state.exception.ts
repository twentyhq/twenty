import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export class AgentHistoryMigrationStateException extends CustomException<
  'INVALID_STATE' | 'MISSING_STATE'
> {
  constructor(code: 'INVALID_STATE' | 'MISSING_STATE', message: string) {
    super(message, code, {
      userFriendlyMessage: msg`Unable to access AI history. Please try again.`,
    });
  }
}
