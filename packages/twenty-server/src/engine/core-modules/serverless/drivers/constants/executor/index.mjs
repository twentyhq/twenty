import { promises as fs } from 'fs';
import { randomBytes } from 'crypto';

export const handler = async (event) => {
  const randomId = randomBytes(16).toString('hex');

  const mainPath = `/tmp/${randomId}.mjs`;

  const oldProcessEnv = { ...process.env };

  try {
    const { code, params, env } = event;

    await fs.writeFile(mainPath, code, 'utf8');

    process.env = { ...process.env, ...(env ?? {}) };

    const mainFile = await import(mainPath);

    return await mainFile.main(params);
  } finally {
    await fs.rm(mainPath, { force: true });
    process.env = oldProcessEnv;
  }
};
