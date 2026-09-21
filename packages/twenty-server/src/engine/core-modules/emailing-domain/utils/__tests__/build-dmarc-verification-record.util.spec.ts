import { buildDmarcVerificationRecord } from 'src/engine/core-modules/emailing-domain/utils/build-dmarc-verification-record.util';

describe('buildDmarcVerificationRecord', () => {
  it('should publish the policy at the _dmarc subdomain of the sending domain', () => {
    expect(buildDmarcVerificationRecord('acme.com')).toEqual({
      type: 'TXT',
      key: '_dmarc.acme.com',
      value: 'v=DMARC1; p=none; rua=mailto:dmarc@acme.com',
    });
  });

  it('should keep aggregate reports on the sending domain so no external destination authorization is needed', () => {
    const record = buildDmarcVerificationRecord('mail.acme.co.uk');

    expect(record.value).toContain('rua=mailto:dmarc@mail.acme.co.uk');
  });

  it('should start in monitoring mode so an unaligned sender is reported rather than rejected', () => {
    expect(buildDmarcVerificationRecord('acme.com').value).toContain('p=none');
  });
});
