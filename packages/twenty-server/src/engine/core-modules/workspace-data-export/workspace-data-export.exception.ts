import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export type WorkspaceDataExportExceptionCode =
  | 'WORKSPACE_NOT_FOUND'
  | 'EXPORT_ALREADY_RUNNING';

const USER_FRIENDLY_MESSAGES = {
  WORKSPACE_NOT_FOUND: msg`Workspace not found.`,
  EXPORT_ALREADY_RUNNING: msg`An export is already running for this workspace.`,
} as const;

export class WorkspaceDataExportException extends CustomException<WorkspaceDataExportExceptionCode> {
  constructor(message: string, code: WorkspaceDataExportExceptionCode) {
    super(message, code, {
      userFriendlyMessage: USER_FRIENDLY_MESSAGES[code],
    });
  }
}
