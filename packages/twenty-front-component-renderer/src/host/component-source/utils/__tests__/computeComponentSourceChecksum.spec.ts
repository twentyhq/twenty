import { createHash, webcrypto } from 'node:crypto';
import { TextEncoder as NodeTextEncoder } from 'node:util';

import { computeComponentSourceChecksum } from '@/host/component-source/utils/computeComponentSourceChecksum';

const SOURCES = [
  'export default () => {};',
  'export const label = "héllo wörld ✓";',
];

const computeSha256Hex = (content: string): string =>
  createHash('sha256').update(content).digest('hex');

describe('computeComponentSourceChecksum', () => {
  const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  const originalTextEncoder = (
    globalThis as unknown as { TextEncoder?: unknown }
  ).TextEncoder;

  beforeEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: webcrypto,
      configurable: true,
    });
    (globalThis as unknown as { TextEncoder: unknown }).TextEncoder =
      NodeTextEncoder;
  });

  afterEach(() => {
    if (originalCrypto !== undefined) {
      Object.defineProperty(globalThis, 'crypto', originalCrypto);
    }

    (globalThis as unknown as { TextEncoder?: unknown }).TextEncoder =
      originalTextEncoder;
  });

  it.each(SOURCES)(
    'matches the SHA-256 hex digest with WebCrypto for %j',
    async (source) => {
      await expect(computeComponentSourceChecksum({ source })).resolves.toBe(
        computeSha256Hex(source),
      );
    },
  );

  it.each(SOURCES)(
    'matches the SHA-256 hex digest without WebCrypto for %j',
    async (source) => {
      Object.defineProperty(globalThis, 'crypto', {
        value: undefined,
        configurable: true,
      });

      await expect(computeComponentSourceChecksum({ source })).resolves.toBe(
        computeSha256Hex(source),
      );
    },
  );

  it('matches the SHA-256 hex digest when crypto.subtle.digest throws', async () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        subtle: {
          digest: () => {
            throw new Error('opaque origin');
          },
        },
      },
      configurable: true,
    });

    await expect(
      computeComponentSourceChecksum({ source: SOURCES[0] }),
    ).resolves.toBe(computeSha256Hex(SOURCES[0]));
  });
});
