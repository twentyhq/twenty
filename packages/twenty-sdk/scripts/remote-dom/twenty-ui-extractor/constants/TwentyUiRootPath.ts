import * as path from 'path';
import { fileURLToPath } from 'url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(SCRIPT_DIR, '../../../../../../');
const TWENTY_UI_ROOT = path.join(WORKSPACE_ROOT, 'packages/twenty-ui');

export const TWENTY_UI_ROOT_PATH = TWENTY_UI_ROOT;
