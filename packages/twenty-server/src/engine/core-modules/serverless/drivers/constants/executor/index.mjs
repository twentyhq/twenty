import { promises as fs } from 'fs';
import { randomBytes } from 'crypto';

export const handler = async (event) => {
  const randomId = randomBytes(16).toString('hex');

  const mainPath = `/tmp/${randomId}.mjs`;

  try {
    const { code, params } = event;

    await fs.writeFile(mainPath, code, 'utf8');

    process.env = {};

    const mainFile = await import(mainPath);

    return await mainFile.main(params);
  } finally {
    await fs.rm(mainPath, { force: true });
  }
};
