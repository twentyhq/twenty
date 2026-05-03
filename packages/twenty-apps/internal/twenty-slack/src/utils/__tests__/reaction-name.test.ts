import { describe, expect, it } from 'vitest';

import { validateReactionName } from '../reaction-name';

describe('validateReactionName', () => {
  it('accepts simple emoji names', () => {
    expect(validateReactionName('thumbsup')).toBeUndefined();
    expect(validateReactionName('+1')).toBeUndefined();
    expect(validateReactionName('white_check_mark')).toBeUndefined();
  });

  it('rejects colons', () => {
    expect(validateReactionName(':thumbsup:')).toMatch(/colons/);
  });

  it('rejects empty', () => {
    expect(validateReactionName('   ')).toMatch(/empty/);
  });
});
