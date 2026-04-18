import { promises as fs } from 'fs';
import { createHash } from 'crypto';

export const handler = async (event) => {
  const handlerStartMs = Date.now();
  const { code, params, env, handlerName } = event;

  // Use a content-hash filename so identical code is written once per
  // warm container and Node's ESM module cache can short-circuit subsequent
  // `import(mainPath)` calls. With random names, every warm invocation
  // re-parsed and re-evaluated the entire user bundle (~hundreds of ms
  // for typical apps, dominating Lambda warm-start latency).
  const codeHash = createHash('sha1').update(code).digest('hex').slice(0, 16);
  const mainPath = `/tmp/${codeHash}.mjs`;

  // oxlint-disable-next-line no-undef
  const oldProcessEnv = { ...process.env };

  try {
    const codeBytes =
      typeof code === 'string' ? Buffer.byteLength(code, 'utf8') : 0;

    const beforeWriteMs = Date.now();
    let wrote = 0;
    try {
      await fs.access(mainPath);
    } catch {
      await fs.writeFile(mainPath, code, 'utf8');
      wrote = 1;
    }
    const writeMs = Date.now() - beforeWriteMs;

    // oxlint-disable-next-line no-undef
    process.env = { ...process.env, ...(env ?? {}) };

    const beforeImportMs = Date.now();
    const mainFile = await import(mainPath);
    const importMs = Date.now() - beforeImportMs;

    const handlerFn = handlerName
      .split('.')
      .reduce((obj, key) => obj[key], mainFile);

    const beforeUserHandlerMs = Date.now();
    // Goes to CloudWatch — used to monitor that warm invocations actually
    // hit the cache (`wrote=0 importMs=0`) after the executor cache fix.
    // oxlint-disable-next-line no-console
    console.log(
      `[executor-timing] codeBytes=${codeBytes} wrote=${wrote} writeMs=${writeMs} importMs=${importMs} preHandlerMs=${beforeUserHandlerMs - handlerStartMs}`,
    );
    const result = await handlerFn(params);
    // oxlint-disable-next-line no-console
    console.log(
      `[executor-timing] handlerMs=${Date.now() - beforeUserHandlerMs} totalMs=${Date.now() - handlerStartMs}`,
    );

    return result;
  } finally {
    // Intentionally NOT removing `mainPath` here: we want the file (and the
    // associated ESM cache entry) to survive across warm invocations.
    // /tmp is wiped automatically when the container is recycled.

    // oxlint-disable-next-line no-undef
    process.env = oldProcessEnv;
  }
};
