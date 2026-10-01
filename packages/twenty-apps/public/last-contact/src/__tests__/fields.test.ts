import { readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

const FIELDS_DIRECTORY = fileURLToPath(new URL('../fields', import.meta.url));

const FIELD_FILE_NAMES = readdirSync(FIELDS_DIRECTORY).filter((fileName) =>
  fileName.endsWith('.field.ts'),
);

describe('fields', () => {
  it('finds the field definitions', () => {
    expect(FIELD_FILE_NAMES.length).toBeGreaterThan(0);
  });

  it.each(FIELD_FILE_NAMES)(
    'keeps %s off the record timeline',
    async (fileName) => {
      const { default: field } = await import(join(FIELDS_DIRECTORY, fileName));

      expect(field.success).toBe(true);
      expect(field.config.isAuditLogged).toBe(false);
    },
  );
});
