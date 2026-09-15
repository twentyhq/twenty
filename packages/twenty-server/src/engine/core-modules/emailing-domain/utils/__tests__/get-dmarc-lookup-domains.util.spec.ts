import { getDmarcLookupDomains } from 'src/engine/core-modules/emailing-domain/utils/get-dmarc-lookup-domains.util';

describe('getDmarcLookupDomains', () => {
  it('should look up the organizational domain only once for a domain that is already one', () => {
    expect(getDmarcLookupDomains('acme.com')).toEqual(['acme.com']);
  });

  it('should fall back to the organizational domain, whose policy a subdomain inherits', () => {
    expect(getDmarcLookupDomains('mail.acme.com')).toEqual([
      'mail.acme.com',
      'acme.com',
    ]);
  });

  it('should treat a multi-label public suffix as one organizational domain', () => {
    expect(getDmarcLookupDomains('send.acme.co.uk')).toEqual([
      'send.acme.co.uk',
      'acme.co.uk',
    ]);
  });

  it('should stay with the given name when it cannot be parsed as a public domain', () => {
    expect(getDmarcLookupDomains('localhost')).toEqual(['localhost']);
  });
});
