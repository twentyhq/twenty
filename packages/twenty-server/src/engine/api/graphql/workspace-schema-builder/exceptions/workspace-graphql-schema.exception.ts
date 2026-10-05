import { type MessageDescriptor } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum WorkspaceGraphQLSchemaExceptionCode {
  QUERY_TYPE_NOT_FOUND = 'QUERY_TYPE_NOT_FOUND',
  MUTATION_TYPE_NOT_FOUND = 'MUTATION_TYPE_NOT_FOUND',
}

const getWorkspaceGraphQLSchemaExceptionUserFriendlyMessage = (
  code: WorkspaceGraphQLSchemaExceptionCode,
) => {
  switch (code) {
    case WorkspaceGraphQLSchemaExceptionCode.QUERY_TYPE_NOT_FOUND:
    case WorkspaceGraphQLSchemaExceptionCode.MUTATION_TYPE_NOT_FOUND:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};
const WORKSPACE_GRAPH_QL_SCHEMA_EXCEPTION_CATEGORY_BY_CODE = {
  [WorkspaceGraphQLSchemaExceptionCode.QUERY_TYPE_NOT_FOUND]:
    'INTERNAL_SERVER_ERROR',
  [WorkspaceGraphQLSchemaExceptionCode.MUTATION_TYPE_NOT_FOUND]:
    'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  WorkspaceGraphQLSchemaExceptionCode,
  ExceptionCategory
>;

export class WorkspaceGraphQLSchemaException extends CustomException<WorkspaceGraphQLSchemaExceptionCode> {
  constructor(
    message: string,
    code: WorkspaceGraphQLSchemaExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getWorkspaceGraphQLSchemaExceptionUserFriendlyMessage(code),
      category: WORKSPACE_GRAPH_QL_SCHEMA_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
