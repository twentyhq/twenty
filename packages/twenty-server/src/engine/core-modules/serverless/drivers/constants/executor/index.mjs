import { promises as fs } from 'fs';
import { v4 } from 'uuid';

const MAIN_PATH = '/tmp/main.mjs';

export const handler = async (event) => {
  const { code, params } = event;

  await fs.writeFile(MAIN_PATH, code, 'utf8');

  const mainFile = await import(MAIN_PATH + `?t=${v4()}`);

  const result = await mainFile.main(params);

  await fs.rm('tmp', { recursive: true, force: true });

  return result
};
