import { msg } from '@lingui/core/macro';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';
const AGENT_HISTORY_MIGRATION_STATE_EXCEPTION_CATEGORY_BY_CODE = {
  INVALID_STATE: 'INTERNAL_SERVER_ERROR',
  MISSING_STATE: 'INTERNAL_SERVER_ERROR',
  INVALID_WORKSPACE: 'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  'INVALID_STATE' | 'MISSING_STATE' | 'INVALID_WORKSPACE',
  ExceptionCategory
>;

export class AgentHistoryMigrationStateException extends CustomException<
  'INVALID_STATE' | 'MISSING_STATE' | 'INVALID_WORKSPACE'
> {
  constructor(
    code: 'INVALID_STATE' | 'MISSING_STATE' | 'INVALID_WORKSPACE',
    message: string,
  ) {
    super(message, code, {
      userFriendlyMessage: msg`Unable to access AI history. Please try again.`,
      category: AGENT_HISTORY_MIGRATION_STATE_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
