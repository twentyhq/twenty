import {
  compressToUTF16,
  decompressFromUTF16,
} from 'lz-string';

import { type SyncStringStorage } from 'jotai/vanilla/utils/atomWithStorage';

// OMNIA-CUSTOM: Compressed localStorage adapter for Jotai atomWithStorage.
// Our workspace metadata (~1.4MB JSON across 23 entity types × current+draft)
// exceeds Safari's 5MB localStorage quota. lz-string's UTF-16 compression
// typically achieves 80-90% reduction on JSON, keeping us well within limits.
export const createCompressedLocalStorage = (): SyncStringStorage => ({
  getItem: (key: string): string | null => {
    const compressed = localStorage.getItem(key);

    if (compressed === null) {
      return null;
    }

    try {
      const decompressed = decompressFromUTF16(compressed);

      // If decompression returns null/empty, the value may be uncompressed
      // (e.g. from before compression was enabled). Try returning raw value.
      if (decompressed === null || decompressed === '') {
        return compressed;
      }

      return decompressed;
    } catch {
      // Fallback: value might be stored uncompressed from a previous version
      return compressed;
    }
  },
  setItem: (key: string, newValue: string): void => {
    try {
      const compressed = compressToUTF16(newValue);
      localStorage.setItem(key, compressed);
    } catch {
      // QuotaExceededError — silently skip rather than crash
    }
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },
});
