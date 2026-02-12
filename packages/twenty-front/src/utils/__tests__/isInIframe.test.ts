import { isInFrame } from '~/utils/isInIframe';

describe('isInFrame', () => {
  it('should return a boolean value', () => {
    const result = isInFrame();
    expect(typeof result).toBe('boolean');
  });

  it('should not throw an error when called', () => {
    expect(() => isInFrame()).not.toThrow();
  });
});
