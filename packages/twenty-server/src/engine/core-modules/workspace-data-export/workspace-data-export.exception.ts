import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export type WorkspaceDataExportExceptionCode =
  | 'WORKSPACE_NOT_FOUND'
  | 'EXPORT_ALREADY_RUNNING'
  | 'EXPORT_INCOMPLETE';

const USER_FRIENDLY_MESSAGES = {
  WORKSPACE_NOT_FOUND: msg`Workspace not found.`,
  EXPORT_ALREADY_RUNNING: msg`An export is already running for this workspace.`,
  EXPORT_INCOMPLETE: msg`The export is missing data and could not be completed.`,
} as const;

export class WorkspaceDataExportException extends CustomException<WorkspaceDataExportExceptionCode> {
  constructor({
    message,
    code,
  }: {
    message: string;
    code: WorkspaceDataExportExceptionCode;
  }) {
    super(message, code, {
      userFriendlyMessage: USER_FRIENDLY_MESSAGES[code],
    });
  }
}
