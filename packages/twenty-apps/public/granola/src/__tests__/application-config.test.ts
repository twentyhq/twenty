import { describe, expect, it } from 'vitest';
import * as identifiers from 'src/constants/universal-identifiers';

describe('application identifiers', () => {
  it('uses distinct identifiers and allocates new ones as UUID v4', () => {
    const entries = Object.entries(identifiers).filter(([name]) =>
      name.endsWith('_UNIVERSAL_IDENTIFIER'),
    );
    const values = entries.map(([, value]) => value);
    expect(new Set(values).size).toBe(values.length);
    for (const [name, value] of entries) {
      if (
        name === 'GRANOLA_WORKSPACE_SETTINGS_MENU_ITEM_UNIVERSAL_IDENTIFIER'
      ) {
        expect(value).toBe('88818f31-8217-5712-a954-ccce6bd823e1');
        continue;
      }

      expect(value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    }
  });
});
