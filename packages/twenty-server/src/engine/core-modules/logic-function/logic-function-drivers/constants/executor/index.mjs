import { promises as fs } from 'fs';
import { createHash } from 'crypto';

// Unified executor that handles both execution modes for a logic function:
//
// - LIVE  ("hot" iteration): the caller ships the compiled bundle in
//   `event.code` and we evaluate it dynamically from /tmp. Behavior is
//   identical to the historical executor: content-hash filename so warm
//   containers hit Node's ESM module cache and avoid re-parsing.
//
// - PREBUILT (production): `event.code` is absent; the compiled bundle
//   was installed onto the Lambda's deployment package as
//   `./prebuilt-logic-function.mjs`. We import it directly, which means
//   every cold start avoids the JSON-payload-shipping cost and warm
//   invocations hit the regular ESM module cache.
//
// Module-scoped state and side-effects in the user bundle are intentionally
// shared across invocations of the same container, in both modes.
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
