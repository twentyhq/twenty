import { validate } from 'src/engine/core-modules/twenty-config/config-variables';

describe('SUBDOMAIN_MIN_LENGTH config variable', () => {
  it('accepts an integer within the supported format range', () => {
    expect(() => validate({ SUBDOMAIN_MIN_LENGTH: '2' })).not.toThrow();
  });

  it('rejects non-integer values', () => {
    expect(() => validate({ SUBDOMAIN_MIN_LENGTH: '2.5' })).toThrow();
  });

  it('rejects values below the minimum', () => {
    expect(() => validate({ SUBDOMAIN_MIN_LENGTH: '0' })).toThrow();
  });

  it('rejects values above the subdomain length limit', () => {
    expect(() => validate({ SUBDOMAIN_MIN_LENGTH: '31' })).toThrow();
  });
});
