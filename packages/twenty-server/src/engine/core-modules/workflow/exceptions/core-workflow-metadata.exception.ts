import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum CoreWorkflowMetadataExceptionCode {
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

export class CoreWorkflowMetadataException extends CustomException {
  constructor(message: string, code: CoreWorkflowMetadataExceptionCode) {
    super(message, code, {
      userFriendlyMessage:
        getCoreWorkflowMetadataExceptionUserFriendlyMessage(code),
    });
  }
}
