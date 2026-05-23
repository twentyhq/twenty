import { promises as fs } from 'fs';
import { createHash } from 'crypto';

export const handler = async (event) => {
  const { code, params, env, handlerName } = event;

  // oxlint-disable-next-line no-undef
  const oldProcessEnv = { ...process.env };

  try {
    // oxlint-disable-next-line no-undef
    process.env = { ...process.env, ...(env ?? {}) };

    const mainFile = code
      ? await loadFromPayload(code)
      : await import('./prebuilt-logic-function.mjs');

    const handlerFn = handlerName
      .split('.')
      .reduce((obj, key) => obj[key], mainFile);

    return await handlerFn(params);
  } finally {
    // oxlint-disable-next-line no-undef
    process.env = oldProcessEnv;
  }
};

const loadFromPayload = async (code) => {
  const codeHash = createHash('sha256').update(code).digest('hex');
  const mainPath = `/tmp/${codeHash}.mjs`;

  try {
    await fs.access(mainPath);
  } catch {
    await fs.writeFile(mainPath, code, 'utf8');
  }

  return import(mainPath);
};
