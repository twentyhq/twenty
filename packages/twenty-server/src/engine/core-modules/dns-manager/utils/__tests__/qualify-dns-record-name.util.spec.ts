import { qualifyDnsRecordName } from 'src/engine/core-modules/dns-manager/utils/qualify-dns-record-name.util';

describe('qualifyDnsRecordName', () => {
  it('should keep a name that already ends with the domain', () => {
    expect(
      qualifyDnsRecordName({
        name: 'token._domainkey.Example.com.',
        domain: 'example.com',
      }),
    ).toBe('token._domainkey.example.com');
  });

  it('should append the domain to a name given relative to it', () => {
    expect(
      qualifyDnsRecordName({
        name: 'resend._domainkey',
        domain: 'example.com',
      }),
    ).toBe('resend._domainkey.example.com');
  });

  it('should not treat a lookalike suffix as the domain', () => {
    expect(
      qualifyDnsRecordName({
        name: 'send.notexample.com',
        domain: 'example.com',
      }),
    ).toBe('send.notexample.com.example.com');
  });
});
