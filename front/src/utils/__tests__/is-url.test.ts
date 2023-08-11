import { isURL } from '~/utils/is-url';

describe('isURL', () => {
  it(`should return false if null`, () => {
    expect(isURL(null)).toBeFalsy();
  });

  it(`should return false if undefined`, () => {
    expect(isURL(undefined)).toBeFalsy();
  });

  it(`should return true if string google`, () => {
    expect(isURL('google')).toBeFalsy();
  });

  it(`should return true if string google.com`, () => {
    expect(isURL('google.com')).toBeTruthy();
  });

  it(`should return true if string bbc.co.uk`, () => {
    expect(isURL('bbc.co.uk')).toBeTruthy();
  });

  it(`should return true if string web.io`, () => {
    expect(isURL('web.io')).toBeTruthy();
  });

  it(`should return true if string x.com`, () => {
    expect(isURL('x.com')).toBeTruthy();
  });

  it(`should return true if string 2.com`, () => {
    expect(isURL('2.com')).toBeTruthy();
  });

  it(`should return true if string https://2.com/test/`, () => {
    expect(isURL('https://2.com/test/')).toBeTruthy();
  });

  it(`should return false if string https://2.com/test/sldkfj!?`, () => {
    expect(isURL('https://2.com/test/sldkfj!?')).toBeFalsy();
  });
});
