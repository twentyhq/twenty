import * as os from 'os';
import * as path from 'path';

export const getConfigPath = (): string => {
  if (process.env.TWENTY_CONFIG_PATH) {
    return path.resolve(process.env.TWENTY_CONFIG_PATH);
  }

  return path.join(os.homedir(), '.twenty', 'config.json');
};
