import { WorkspaceExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceException extends CustomException {
  constructor(message: string, code: WorkspaceExceptionCode) {
    super(message, code);
  }
}
