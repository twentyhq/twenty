import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __frontComponentFileRegistrySizeForTests as registrySize,
  clearRegisteredFrontComponentFiles,
  readRegisteredFrontComponentFileBytes,
  registerFrontComponentFile,
} from '../frontComponentFileRegistry';

const blobOf = (bytes: number[], type = 'application/octet-stream'): Blob =>
  new Blob([new Uint8Array(bytes)], { type });

describe('frontComponentFileRegistry', () => {
  beforeEach(() => {
    clearRegisteredFrontComponentFiles();
  });

  it('registers a file and reads its exact bytes back', async () => {
    const token = registerFrontComponentFile(blobOf([1, 2, 3, 4]));
    expect(typeof token).toBe('string');

    const buffer = await readRegisteredFrontComponentFileBytes(token as string);
    expect(buffer).not.toBeNull();
    expect(Array.from(new Uint8Array(buffer as ArrayBuffer))).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it('returns null for an unknown token', async () => {
    expect(await readRegisteredFrontComponentFileBytes('does-not-exist')).toBeNull();
  });

  it('returns no token for a value that is not a readable file', () => {
    expect(registerFrontComponentFile(null)).toBeUndefined();
    expect(registerFrontComponentFile({})).toBeUndefined();
    expect(registerFrontComponentFile({ name: 'a', size: 1 })).toBeUndefined();
  });

  it('evicts the oldest entry once the cap is exceeded', async () => {
    // Cap is 16; register 17 distinct files.
    const tokens: string[] = [];
    for (let i = 0; i < 17; i++) {
      const token = registerFrontComponentFile(blobOf([i]));
      expect(token).toBeDefined();
      tokens.push(token as string);
      // Size is bounded at every step.
      expect(registrySize()).toBeLessThanOrEqual(16);
    }

    // The very first file was evicted; the newest survives.
    expect(await readRegisteredFrontComponentFileBytes(tokens[0])).toBeNull();
    expect(
      await readRegisteredFrontComponentFileBytes(tokens[16]),
    ).not.toBeNull();
  });

  it('refuses a file larger than the host ceiling', async () => {
    // 12 MB ceiling; claim 13 MB. Still registrable (has arrayBuffer), but the
    // read must refuse it rather than buffer it.
    const oversized = {
      size: 13 * 1024 * 1024,
      type: 'image/png',
      name: 'huge.png',
      arrayBuffer: async () => new ArrayBuffer(8),
    };
    const token = registerFrontComponentFile(oversized);
    expect(token).toBeDefined();
    expect(await readRegisteredFrontComponentFileBytes(token as string)).toBeNull();
  });

  it('expires entries past the TTL', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(0));
      const token = registerFrontComponentFile(blobOf([9]));
      expect(token).toBeDefined();

      // Just inside the TTL: still readable.
      vi.setSystemTime(new Date(4 * 60 * 1000));
      expect(
        await readRegisteredFrontComponentFileBytes(token as string),
      ).not.toBeNull();

      // Past the 5-minute TTL: pruned away.
      vi.setSystemTime(new Date(6 * 60 * 1000));
      expect(
        await readRegisteredFrontComponentFileBytes(token as string),
      ).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('clears all registered files', async () => {
    const token = registerFrontComponentFile(blobOf([1]));
    expect(registrySize()).toBe(1);
    clearRegisteredFrontComponentFiles();
    expect(registrySize()).toBe(0);
    expect(await readRegisteredFrontComponentFileBytes(token as string)).toBeNull();
  });
});
