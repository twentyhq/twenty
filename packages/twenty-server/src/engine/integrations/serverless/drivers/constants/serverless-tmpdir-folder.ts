import { join } from 'path';
import { tmpdir } from 'os';

export const SERVERLESS_TMPDIR_FOLDER = join(tmpdir(), 'serverless-tmpdir');
