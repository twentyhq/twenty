import Cookies from 'js-cookie';

import { readPartnerFromCookie } from '@/auth/utils/readPartnerFromCookie';

describe('readPartnerFromCookie', () => {
  afterEach(() => {
    Cookies.remove('partner');
  });

  it('should return the stored partner', () => {
    Cookies.set('partner', JSON.stringify({ partner: 'northwind' }));

    expect(readPartnerFromCookie()).toBe('northwind');
  });

  it('should return undefined without a cookie', () => {
    expect(readPartnerFromCookie()).toBeUndefined();
  });

  it('should return undefined for a malformed cookie', () => {
    Cookies.set('partner', 'not-json');

    expect(readPartnerFromCookie()).toBeUndefined();
  });

  it('should return undefined for an invalid partner', () => {
    Cookies.set('partner', JSON.stringify({ partner: 'north wind!' }));

    expect(readPartnerFromCookie()).toBeUndefined();
  });
});
