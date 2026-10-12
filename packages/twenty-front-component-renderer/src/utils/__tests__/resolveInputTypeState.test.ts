import { resolveInputTypeState } from '../resolveInputTypeState';

describe('resolveInputTypeState', () => {
  it.each([
    ['checkbox', 'checkbox'],
    ['EMAIL', 'email'],
    ['datetime-local', 'datetime-local'],
  ])('should keep the known type %s as %s', (type, expectedState) => {
    expect(resolveInputTypeState(type)).toBe(expectedState);
  });

  it.each([undefined, null, '', 'datetime', 'bogus', 3])(
    'should fall back to text for %p',
    (type) => {
      expect(resolveInputTypeState(type)).toBe('text');
    },
  );
});
