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
    jest.restoreAllMocks();

    if (originalCrypto !== undefined) {
      Object.defineProperty(globalThis, 'crypto', originalCrypto);
    }

    (globalThis as unknown as { TextEncoder?: unknown }).TextEncoder =
      originalTextEncoder;
  });

  it.each(SOURCES)(
    'computes the SHA-256 hex digest of %j with WebCrypto',
    async (source) => {
      const digestSpy = jest.spyOn(webcrypto.subtle, 'digest');

      await expect(computeComponentSourceChecksum({ source })).resolves.toBe(
        computeSha256Hex(source),
      );
      expect(digestSpy).toHaveBeenCalledWith('SHA-256', expect.anything());
    },
  );

  it.each([
    ['crypto is undefined', undefined],
    ['crypto has no subtle', {}],
    [
      'crypto.subtle.digest throws',
      {
        subtle: {
          digest: () => {
            throw new Error('opaque origin');
          },
        },
      },
    ],
  ])(
    'computes the same digest without WebCrypto when %s',
    async (_label, unusableCrypto) => {
      const digestSpy = jest.spyOn(webcrypto.subtle, 'digest');

      Object.defineProperty(globalThis, 'crypto', {
        value: unusableCrypto,
        configurable: true,
      });

      for (const source of SOURCES) {
        await expect(computeComponentSourceChecksum({ source })).resolves.toBe(
          computeSha256Hex(source),
        );
      }

      expect(digestSpy).not.toHaveBeenCalled();
    },
  );
});
