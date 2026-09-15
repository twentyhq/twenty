import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { appUninstall } from 'twenty-sdk/cli';

const APP_PATH = process.cwd();
const CONFIG_DIR = path.join(os.homedir(), '.twenty');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.test.json');

export const teardown = async () => {
  try {
    await appUninstall({ appPath: APP_PATH });
  } finally {
    fs.rmSync(CONFIG_PATH, { force: true });
  }
};
