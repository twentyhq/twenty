import { buildAwsSesVerificationRecords } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/utils/build-aws-ses-verification-records.util';

describe('buildAwsSesVerificationRecords', () => {
  it('should return one CNAME per DKIM token', () => {
    const records = buildAwsSesVerificationRecords({
      domain: 'acme.com',
      dkimTokens: ['tokenone', 'tokentwo', 'tokenthree'],
      region: 'eu-west-3',
    });

    expect(records.filter((record) => record.type === 'CNAME')).toEqual([
      {
        type: 'CNAME',
        key: 'tokenone._domainkey.acme.com',
        value: 'tokenone.dkim.amazonses.com',
      },
      {
        type: 'CNAME',
        key: 'tokentwo._domainkey.acme.com',
        value: 'tokentwo.dkim.amazonses.com',
      },
      {
        type: 'CNAME',
        key: 'tokenthree._domainkey.acme.com',
        value: 'tokenthree.dkim.amazonses.com',
      },
    ]);
  });

  it('should return exactly one MX record on the mail from subdomain pointing at the client region', () => {
    const records = buildAwsSesVerificationRecords({
      domain: 'acme.com',
      dkimTokens: [],
      region: 'us-east-1',
    });

    expect(records.filter((record) => record.type === 'MX')).toEqual([
      {
        type: 'MX',
        key: 'bounce.acme.com',
        value: 'feedback-smtp.us-east-1.amazonses.com',
        priority: 10,
      },
    ]);
  });

  it('should return the SPF record on the mail from subdomain', () => {
    const records = buildAwsSesVerificationRecords({
      domain: 'acme.com',
      dkimTokens: [],
      region: 'us-east-1',
    });

    expect(records.filter((record) => record.type === 'TXT')).toEqual([
      {
        type: 'TXT',
        key: 'bounce.acme.com',
        value: 'v=spf1 include:amazonses.com ~all',
      },
    ]);
  });

  it('should still return the mail from records when SES returned no DKIM token yet', () => {
    const records = buildAwsSesVerificationRecords({
      domain: 'acme.com',
      dkimTokens: [],
      region: 'eu-west-3',
    });

    expect(records).toHaveLength(2);
  });
});
