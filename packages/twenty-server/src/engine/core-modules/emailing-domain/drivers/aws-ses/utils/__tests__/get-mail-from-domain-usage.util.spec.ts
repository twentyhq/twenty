import { getMailFromDomainUsage } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/utils/get-mail-from-domain-usage.util';

const SES_MAIL_EXCHANGE = 'feedback-smtp.eu-central-1.amazonses.com';

const NO_RECORDS = {
  canonicalNames: [],
  mailExchanges: [],
  textRecords: [],
  addresses: [],
};

describe('getMailFromDomainUsage', () => {
  it('should consider a name without any record free to use', () => {
    expect(
      getMailFromDomainUsage({
        dnsRecords: NO_RECORDS,
        sesMailExchange: SES_MAIL_EXCHANGE,
      }),
    ).toBe('FREE');
  });

  it('should consider a name aliased to another sending service taken', () => {
    expect(
      getMailFromDomainUsage({
        dnsRecords: {
          ...NO_RECORDS,
          canonicalNames: [
            'bounce.faz.de.inbound.cdp1.cehfhs.mx.salesforce.com',
          ],
        },
        sesMailExchange: SES_MAIL_EXCHANGE,
      }),
    ).toBe('TAKEN');
  });

  it('should consider a name receiving mail elsewhere taken', () => {
    expect(
      getMailFromDomainUsage({
        dnsRecords: {
          ...NO_RECORDS,
          mailExchanges: ['bounce1.cdp1.cehfhs.mx.salesforce.com'],
        },
        sesMailExchange: SES_MAIL_EXCHANGE,
      }),
    ).toBe('TAKEN');
  });

  it('should recognise records already published for SES so a half-finished setup is kept', () => {
    expect(
      getMailFromDomainUsage({
        dnsRecords: {
          ...NO_RECORDS,
          mailExchanges: ['feedback-smtp.eu-central-1.amazonses.com'],
          textRecords: ['v=spf1 include:amazonses.com ~all'],
        },
        sesMailExchange: SES_MAIL_EXCHANGE,
      }),
    ).toBe('POINTS_TO_SES');
  });

  it('should consider a name with an unrelated SPF policy taken', () => {
    expect(
      getMailFromDomainUsage({
        dnsRecords: {
          ...NO_RECORDS,
          textRecords: ['v=spf1 include:_spf.google.com ~all'],
        },
        sesMailExchange: SES_MAIL_EXCHANGE,
      }),
    ).toBe('TAKEN');
  });
});
