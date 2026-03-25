import * as os from 'os';
import * as path from 'path';

const TEST_CONFIG_DIR = path.join(os.tmpdir(), '.twenty-sdk-test');

export const getConfigPath = (): string => {
  if (process.env.NODE_ENV === 'test') {
    return path.join(TEST_CONFIG_DIR, 'config.json');
  }

  return path.join(os.homedir(), '.twenty', 'config.json');
};
