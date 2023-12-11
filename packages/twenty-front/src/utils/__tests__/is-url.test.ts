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

  it(`should return true if string is https://www.linkedin.com/company/b%C3%B6ke-&-partner-sdft-partmbb/`, () => {
    expect(
      isURL(
        'https://www.linkedin.com/company/b%C3%B6ke-&-partner-sdft-partmbb/',
      ),
    ).toBeTruthy();
  });

  it('should return true if the TLD is long', () => {
    expect(isURL('https://example.travelinsurance')).toBeTruthy();
  });

  it('should return true if the TLD is internationalized', () => {
    // The longest TLD as of now
    // https://stackoverflow.com/questions/9238640/how-long-can-a-tld-possibly-be
    // curl -s http://data.iana.org/TLD/tlds-alpha-by-domain.txt \
    //   | tail -n+2 \
    //   | awk '{ print length, $0 }' \
    //   | sort --numeric-sort --reverse \
    //   | head -n 5
    expect(isURL('https://example.xn--vermgensberatung-pwb')).toBeTruthy();
  });
});
