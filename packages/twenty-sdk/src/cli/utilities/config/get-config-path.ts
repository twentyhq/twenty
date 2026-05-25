import * as os from 'os';
import * as path from 'path';

const TWENTY_DIR = path.join(os.homedir(), '.twenty');

export const getConfigPath = (test = false): string => {
  if (test || process.env.NODE_ENV === 'test') {
    return path.join(TWENTY_DIR, 'config.test.json');
  }

  return path.join(TWENTY_DIR, 'config.json');
};
