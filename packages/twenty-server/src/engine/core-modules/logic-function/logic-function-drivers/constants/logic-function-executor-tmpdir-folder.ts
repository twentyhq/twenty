import { realpathSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Resolved because the local driver's Node permission flags only match real paths.
const resolveTemporaryDirectory = (): string => {
  try {
    return realpathSync(tmpdir());
  } catch {
    return tmpdir();
  }
};

export const LOGIC_FUNCTION_EXECUTOR_TMPDIR_FOLDER = join(
  resolveTemporaryDirectory(),
  'logic-function-executor-tmpdir',
);
