import { isDomain } from '~/utils/is-domain';

describe('isDomain', () => {
  it(`should return false if null`, () => {
    expect(isDomain(null)).toBeFalsy();
  });

  it(`should return false if undefined`, () => {
    expect(isDomain(undefined)).toBeFalsy();
  });

  it(`should return true if string google`, () => {
    expect(isDomain('google')).toBeFalsy();
  });

  it(`should return true if string google.com`, () => {
    expect(isDomain('google.com')).toBeTruthy();
  });

  it(`should return true if string bbc.co.uk`, () => {
    expect(isDomain('bbc.co.uk')).toBeTruthy();
  });

  it(`should return true if string web.io`, () => {
    expect(isDomain('web.io')).toBeTruthy();
  });

  it(`should return true if string x.com`, () => {
    expect(isDomain('x.com')).toBeTruthy();
  });

  it(`should return true if string 2.com`, () => {
    expect(isDomain('2.com')).toBeTruthy();
  });
});
