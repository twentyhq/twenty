import { describe, expect, it } from 'vitest';

import { capitalizeName } from 'src/logic-functions/utils/capitalize-name';

describe('capitalizeName', () => {
  it('should capitalize the first letter of each word', () => {
    expect(capitalizeName('john doe')).toBe('John Doe');
  });

  it('should capitalize letters after hyphens and apostrophes', () => {
    expect(capitalizeName("jean-luc o'brien")).toBe("Jean-Luc O'Brien");
  });

  it('should return an empty string unchanged', () => {
    expect(capitalizeName('')).toBe('');
  });
});
