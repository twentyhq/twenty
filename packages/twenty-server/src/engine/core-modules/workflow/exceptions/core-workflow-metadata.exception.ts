import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum CoreWorkflowMetadataExceptionCode {
  INVALID_WORKFLOW_VERSION_DEFINITION = 'INVALID_WORKFLOW_VERSION_DEFINITION',
  WORKFLOW_NOT_FOUND = 'WORKFLOW_NOT_FOUND',
  WORKFLOW_ALREADY_EXISTS = 'WORKFLOW_ALREADY_EXISTS',
  WORKFLOW_VERSION_NOT_FOUND = 'WORKFLOW_VERSION_NOT_FOUND',
  WORKFLOW_VERSION_ALREADY_EXISTS = 'WORKFLOW_VERSION_ALREADY_EXISTS',
  WORKFLOW_VERSION_MISSING_WORKFLOW = 'WORKFLOW_VERSION_MISSING_WORKFLOW',
}

const getCoreWorkflowMetadataExceptionUserFriendlyMessage = (
  code: CoreWorkflowMetadataExceptionCode,
) => {
  switch (code) {
    case CoreWorkflowMetadataExceptionCode.INVALID_WORKFLOW_VERSION_DEFINITION:
      return msg`The application workflow definition is invalid.`;
    case CoreWorkflowMetadataExceptionCode.WORKFLOW_NOT_FOUND:
      return msg`Workflow not found.`;
    case CoreWorkflowMetadataExceptionCode.WORKFLOW_ALREADY_EXISTS:
      return msg`This workflow already exists.`;
    case CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_NOT_FOUND:
      return msg`Workflow version not found.`;
    case CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_ALREADY_EXISTS:
      return msg`This workflow version already exists.`;
    case CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_MISSING_WORKFLOW:
      return msg`This workflow version is not attached to a workflow.`;
    default:
      assertUnreachable(code);
  }
};

const CORE_WORKFLOW_METADATA_EXCEPTION_CATEGORY_BY_CODE = {
  [CoreWorkflowMetadataExceptionCode.INVALID_WORKFLOW_VERSION_DEFINITION]:
    'INTERNAL_SERVER_ERROR',
  [CoreWorkflowMetadataExceptionCode.WORKFLOW_NOT_FOUND]:
    'INTERNAL_SERVER_ERROR',
  [CoreWorkflowMetadataExceptionCode.WORKFLOW_ALREADY_EXISTS]:
    'INTERNAL_SERVER_ERROR',
  [CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_NOT_FOUND]:
    'INTERNAL_SERVER_ERROR',
  [CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_ALREADY_EXISTS]:
    'INTERNAL_SERVER_ERROR',
  [CoreWorkflowMetadataExceptionCode.WORKFLOW_VERSION_MISSING_WORKFLOW]:
    'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  CoreWorkflowMetadataExceptionCode,
  ExceptionCategory
>;

export class CoreWorkflowMetadataException extends CustomException<CoreWorkflowMetadataExceptionCode> {
  constructor(message: string, code: CoreWorkflowMetadataExceptionCode) {
    super(message, code, {
      userFriendlyMessage:
        getCoreWorkflowMetadataExceptionUserFriendlyMessage(code),
      category: CORE_WORKFLOW_METADATA_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
