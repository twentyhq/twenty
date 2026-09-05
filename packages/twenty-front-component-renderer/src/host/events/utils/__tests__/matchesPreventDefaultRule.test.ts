import { matchesPreventDefaultRule } from '../matchesPreventDefaultRule';

describe('matchesPreventDefaultRule', () => {
  it('should match on the event type alone', () => {
    expect(matchesPreventDefaultRule('submit', { type: 'submit' })).toBe(true);
    expect(matchesPreventDefaultRule('submit', { type: 'click' })).toBe(false);
  });

  it('should match a key only when the type matches too', () => {
    expect(
      matchesPreventDefaultRule('keydown:Enter', { type: 'keydown', key: 'Enter' }),
    ).toBe(true);
    expect(
      matchesPreventDefaultRule('keydown:Enter', { type: 'keyup', key: 'Enter' }),
    ).toBe(false);
    expect(
      matchesPreventDefaultRule('keydown:Enter', { type: 'keydown', key: 'a' }),
    ).toBe(false);
  });

  // The composer case: Enter sends, Shift+Enter must still insert a newline.
  it('should treat modifiers as an exact set', () => {
    expect(
      matchesPreventDefaultRule('keydown:Enter', {
        type: 'keydown',
        key: 'Enter',
        shiftKey: true,
      }),
    ).toBe(false);

    expect(
      matchesPreventDefaultRule('keydown:Shift+Enter', {
        type: 'keydown',
        key: 'Enter',
        shiftKey: true,
      }),
    ).toBe(true);

    expect(
      matchesPreventDefaultRule('keydown:Shift+Enter', {
        type: 'keydown',
        key: 'Enter',
      }),
    ).toBe(false);
  });

  it('should ignore the order and the casing of modifiers', () => {
    const event = {
      type: 'keydown',
      key: 's',
      metaKey: true,
      shiftKey: true,
    };

    expect(matchesPreventDefaultRule('keydown:Meta+Shift+s', event)).toBe(true);
    expect(matchesPreventDefaultRule('keydown:shift+meta+s', event)).toBe(true);
    expect(matchesPreventDefaultRule('keydown:Meta+s', event)).toBe(false);
  });
});
