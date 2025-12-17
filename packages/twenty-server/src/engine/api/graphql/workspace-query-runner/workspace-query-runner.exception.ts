import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const WorkspaceQueryRunnerExceptionCode = appendCommonExceptionCode({
  INVALID_QUERY_INPUT: 'INVALID_QUERY_INPUT',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  QUERY_TIMEOUT: 'QUERY_TIMEOUT',
  QUERY_VIOLATES_UNIQUE_CONSTRAINT: 'QUERY_VIOLATES_UNIQUE_CONSTRAINT',
  QUERY_VIOLATES_FOREIGN_KEY_CONSTRAINT:
    'QUERY_VIOLATES_FOREIGN_KEY_CONSTRAINT',
  TOO_MANY_ROWS_AFFECTED: 'TOO_MANY_ROWS_AFFECTED',
  NO_ROWS_AFFECTED: 'NO_ROWS_AFFECTED',
} as const);

const workspaceQueryRunnerExceptionUserFriendlyMessages: Record<
  keyof typeof WorkspaceQueryRunnerExceptionCode,
  MessageDescriptor
> = {
  INVALID_QUERY_INPUT: msg`Invalid query input.`,
  DATA_NOT_FOUND: msg`Data not found.`,
  QUERY_TIMEOUT: msg`Query timed out.`,
  QUERY_VIOLATES_UNIQUE_CONSTRAINT: msg`A record with this value already exists.`,
  QUERY_VIOLATES_FOREIGN_KEY_CONSTRAINT: msg`Cannot complete operation due to related records.`,
  TOO_MANY_ROWS_AFFECTED: msg`Too many records affected.`,
  NO_ROWS_AFFECTED: msg`No records were affected.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
};

export class WorkspaceQueryRunnerException extends CustomException<
  keyof typeof WorkspaceQueryRunnerExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof WorkspaceQueryRunnerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        workspaceQueryRunnerExceptionUserFriendlyMessages[code],
    });
  }
}
