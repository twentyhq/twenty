import { WorkspaceQueryRunnerExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceQueryRunnerException extends CustomException {
  constructor(message: string, code: WorkspaceQueryRunnerExceptionCode) {
    super(message, code);
  }
}
