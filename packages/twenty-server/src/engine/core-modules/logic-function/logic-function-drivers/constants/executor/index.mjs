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
  // Use a content-hash filename so identical code is written once per
  // warm container and Node's ESM module cache can short-circuit subsequent
  // `import(mainPath)` calls. With random names, every warm invocation
  // re-parsed and re-evaluated the entire user bundle (~hundreds of ms
  // for typical apps, dominating Lambda warm-start latency).
  //
  // Implication: any module-scoped state and side-effects in the user
  // bundle (e.g. in-memory caches) are now intentionally shared across
  // invocations of the same container. Logic functions are expected to
  // treat module scope as a per-container cache, not as per-call isolation.
  //
  // Disk usage tradeoff: when a logic function's compiled bundle changes
  // (e.g. on app deploy), a new file is written and the previous one stays
  // until the container is recycled. This is bounded by the number of
  // distinct bundle hashes a single container sees during its lifetime,
  // which is small in practice; Lambda wipes /tmp on container recycle.
  const codeHash = createHash('sha256').update(code).digest('hex');
  const mainPath = `/tmp/${codeHash}.mjs`;

  try {
    await fs.access(mainPath);
  } catch {
    await fs.writeFile(mainPath, code, 'utf8');
  }

  // Intentionally NOT removing `mainPath` after import so subsequent warm
  // invocations hit Node's ESM cache (see comment above).
  return import(mainPath);
};
