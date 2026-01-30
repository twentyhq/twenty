import { join } from 'path';
import { tmpdir } from 'os';

export const LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER = join(
  tmpdir(),
  'logic-function-executor-tmpdir',
);
