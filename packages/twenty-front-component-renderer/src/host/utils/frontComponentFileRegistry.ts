/**
 * Host-side registry of the real File/Blob objects a user picks (or drops) inside
 * a front-component.
 *
 * Front-components render in a Web Worker that, by design, only ever receives file
 * METADATA (name/size/type/lastModified) — never the bytes (see `serializeFileList`
 * in createHtmlHostWrapper). That makes the obvious `<input type=file>` →
 * FileReader → upload path impossible from inside a component.
 *
 * This registry is the missing half: when the host serializes a file input (or a
 * drop), it stores the real File here under an opaque token and stamps that token
 * onto the metadata. The worker can then call the `readFrontComponentFile` host
 * RPC with the token to pull the bytes on demand — lazily, only when it actually
 * needs to upload — instead of the host eagerly shipping every picked file across
 * the postMessage boundary.
 *
 * The registry is intentionally small and self-pruning: tokens are read once, near
 * the moment of the pick, so a tight cap plus a TTL bounds host memory even if a
 * component re-picks files repeatedly or never reads a token it requested.
 */

type RegistryFile = Blob & {
  readonly name?: string;
  readonly type?: string;
  readonly size?: number;
};

type RegistryEntry = {
  file: RegistryFile;
  registeredAt: number;
};

// Hard cap on retained files. Worst-case retained memory is bounded by
// MAX_ENTRIES * MAX_FILE_BYTES; both are deliberately modest.
const MAX_ENTRIES = 16;

// Tokens are short-lived (picked, then read seconds later by the upload flow).
// Anything older than this is almost certainly an abandoned pick.
const TTL_MS = 5 * 60 * 1000;

// Host ceiling, independent of any individual app's own limit. The marketing
// media route enforces 7 MB; this leaves headroom so the host never silently
// drops a file the app would otherwise have accepted, while still refusing to
// buffer an absurdly large file into memory.
const MAX_FILE_BYTES = 12 * 1024 * 1024;

const registry = new Map<string, RegistryEntry>();

const prune = (): void => {
  const cutoff = Date.now() - TTL_MS;
  for (const [token, entry] of registry) {
    if (entry.registeredAt < cutoff) {
      registry.delete(token);
    }
  }
};

const generateToken = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Non-secure fallback: a token only indexes a host-local Map and authorizes
  // nothing, so collision-avoidance — not unpredictability — is all that matters.
  return `fcf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const isRegistrableFile = (file: unknown): file is RegistryFile =>
  typeof file === 'object' &&
  file !== null &&
  typeof (file as { arrayBuffer?: unknown }).arrayBuffer === 'function';

/**
 * Register a real File/Blob and return the opaque token to stamp onto its
 * serialized metadata. Returns `undefined` for anything that isn't a readable
 * File-like object (in which case the metadata simply ships without a token and
 * the worker falls back to its no-bytes path).
 */
export const registerFrontComponentFile = (
  file: unknown,
): string | undefined => {
  if (!isRegistrableFile(file)) {
    return undefined;
  }

  prune();

  // Map preserves insertion order, so the first key is the oldest. Evict until
  // there's room for the newcomer.
  while (registry.size >= MAX_ENTRIES) {
    const oldestToken = registry.keys().next().value;
    if (oldestToken === undefined) {
      break;
    }
    registry.delete(oldestToken);
  }

  const token = generateToken();
  registry.set(token, { file, registeredAt: Date.now() });
  return token;
};

/**
 * Read the bytes of a previously-registered file. Returns `null` when the token
 * is unknown/expired, when the file exceeds the host ceiling, or when the read
 * fails — callers treat any `null` as "bytes unavailable, fall back".
 */
export const readRegisteredFrontComponentFileBytes = async (
  token: string,
): Promise<ArrayBuffer | null> => {
  prune();

  const entry = registry.get(token);
  if (entry === undefined) {
    return null;
  }

  const size = typeof entry.file.size === 'number' ? entry.file.size : 0;
  if (size > MAX_FILE_BYTES) {
    return null;
  }

  try {
    return await entry.file.arrayBuffer();
  } catch {
    return null;
  }
};

/** Drop every registered file. Exposed for teardown and tests. */
export const clearRegisteredFrontComponentFiles = (): void => {
  registry.clear();
};

/** Test-only: current number of retained files. Not part of the package surface. */
export const __frontComponentFileRegistrySizeForTests = (): number =>
  registry.size;
