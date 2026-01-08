import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
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

const getWorkspaceQueryRunnerExceptionUserFriendlyMessage = (
  code: keyof typeof WorkspaceQueryRunnerExceptionCode,
) => {
  switch (code) {
    case WorkspaceQueryRunnerExceptionCode.QUERY_VIOLATES_UNIQUE_CONSTRAINT:
      return msg`A record with this value already exists.`;
    case WorkspaceQueryRunnerExceptionCode.QUERY_VIOLATES_FOREIGN_KEY_CONSTRAINT:
      return msg`Cannot complete operation due to related records.`;
    case WorkspaceQueryRunnerExceptionCode.TOO_MANY_ROWS_AFFECTED:
      return msg`Too many records affected.`;
    case WorkspaceQueryRunnerExceptionCode.NO_ROWS_AFFECTED:
      return msg`No records were affected.`;
    case WorkspaceQueryRunnerExceptionCode.QUERY_TIMEOUT:
    case WorkspaceQueryRunnerExceptionCode.DATA_NOT_FOUND:
    case WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT:
    case WorkspaceQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
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
        getWorkspaceQueryRunnerExceptionUserFriendlyMessage(code),
    });
  }
}
