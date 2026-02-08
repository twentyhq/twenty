import { msg } from '@lingui/core/macro';
import { z } from 'zod';

import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';

export const assertIsValidEmail = (value: string) => {
  if (!z.email().lowercase().safeParse(value).success) {
    throw new WorkspaceQueryRunnerException(
      `Value "${value}" is not a valid email`,
      WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      { userFriendlyMessage: msg`Invalid email format.` },
    );
  }
};
