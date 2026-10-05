import { isInputSelectionDirection } from '../isInputSelectionDirection';

describe('isInputSelectionDirection', () => {
  it.each(['forward', 'backward', 'none'])('should accept %s', (direction) => {
    expect(isInputSelectionDirection(direction)).toBe(true);
  });

  it.each([null, undefined, 'sideways', 3, {}])(
    'should reject %p',
    (direction) => {
      expect(isInputSelectionDirection(direction)).toBe(false);
    },
  );
});
