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
    const raw = localStorage.getItem(key);

    if (raw === null) {
      return null;
    }

    // Detect uncompressed JSON from before compression was enabled.
    // lz-string UTF-16 compressed data never starts with '{' or '[',
    // so if it looks like JSON, return it directly.
    const firstChar = raw.charAt(0);

    if (firstChar === '{' || firstChar === '[' || firstChar === '"') {
      return raw;
    }

    try {
      const decompressed = decompressFromUTF16(raw);

      if (decompressed === null || decompressed === '') {
        return raw;
      }

      return decompressed;
    } catch {
      return raw;
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
