import { constructIfAvailable } from '../constructIfAvailable';

describe('constructIfAvailable', () => {
  it('constructs an available constructor with the given arguments', () => {
    expect(
      constructIfAvailable(URL, 'https://example.test/audit')?.pathname,
    ).toBe('/audit');
  });

  it('returns undefined when the constructor is absent', () => {
    expect(constructIfAvailable(undefined)).toBeUndefined();
  });
});
