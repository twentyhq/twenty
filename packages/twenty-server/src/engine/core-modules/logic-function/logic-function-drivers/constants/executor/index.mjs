import { promises as fs } from 'fs';
import { randomBytes } from 'crypto';

export const handler = async (event) => {
  const randomId = randomBytes(16).toString('hex');

  const mainPath = `/tmp/${randomId}.mjs`;

  // eslint-disable-next-line no-undef
  const oldProcessEnv = { ...process.env };

  try {
    const { code, params, env, handlerName } = event;

    await fs.writeFile(mainPath, code, 'utf8');

    // eslint-disable-next-line no-undef
    process.env = { ...process.env, ...(env ?? {}) };

    const mainFile = await import(mainPath);

    return await mainFile[handlerName](params);
  } finally {
    await fs.rm(mainPath, { force: true });
    // eslint-disable-next-line no-undef
    process.env = oldProcessEnv;
  }
};
