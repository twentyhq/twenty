import { describe, expect, it } from 'vitest';

import { capitalizeName } from 'src/logic-functions/utils/capitalize-name';

describe('capitalizeName', () => {
  it('capitalizes a lowercase single token', () => {
    expect(capitalizeName('sean')).toBe('Sean');
  });

  it('capitalizes every whitespace-separated token', () => {
    expect(capitalizeName('sean thorne')).toBe('Sean Thorne');
  });

  it('capitalizes after hyphens and apostrophes', () => {
    expect(capitalizeName('mary-jane')).toBe('Mary-Jane');
    expect(capitalizeName("o'brien")).toBe("O'Brien");
  });

  it('leaves already-capitalized names untouched', () => {
    expect(capitalizeName('Jane Doe')).toBe('Jane Doe');
  });

  it('returns an empty string unchanged', () => {
    expect(capitalizeName('')).toBe('');
  });
});
