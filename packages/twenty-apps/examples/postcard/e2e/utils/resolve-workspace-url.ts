import * as fs from 'fs';
import * as path from 'path';

const WORKSPACE_ORIGIN_FILE = path.resolve(
  __dirname,
  '..',
  '.auth',
  'workspace-origin.txt',
);

export const resolveWorkspaceUrl = (): string => {
  const fromEnv = process.env.E2E_WORKSPACE_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  try {
    return fs
      .readFileSync(WORKSPACE_ORIGIN_FILE, 'utf8')
      .trim()
      .replace(/\/$/, '');
  } catch {
    return 'http://app.localhost:3001';
  }
};
