import { buildAwsSesVerificationRecords } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/utils/build-aws-ses-verification-records.util';
import { VerificationRecordPurpose } from 'src/engine/core-modules/emailing-domain/drivers/types/verification-record-purpose.type';

describe('buildAwsSesVerificationRecords', () => {
  it('should return one required CNAME per DKIM token', () => {
    const records = buildAwsSesVerificationRecords({
      domain: 'acme.com',
      dkimTokens: ['tokenone', 'tokentwo', 'tokenthree'],
      dkimStatus: 'SUCCESS',
      mailFromDomain: undefined,
      mailFromStatus: undefined,
      region: 'eu-west-3',
    });

    expect(records).toEqual([
      {
        type: 'CNAME',
        key: 'tokenone._domainkey.acme.com',
        value: 'tokenone.dkim.amazonses.com',
        status: 'success',
        purpose: VerificationRecordPurpose.DKIM,
        isRequired: true,
      },
      {
        type: 'CNAME',
        key: 'tokentwo._domainkey.acme.com',
        value: 'tokentwo.dkim.amazonses.com',
        status: 'success',
        purpose: VerificationRecordPurpose.DKIM,
        isRequired: true,
      },
      {
        type: 'CNAME',
        key: 'tokenthree._domainkey.acme.com',
        value: 'tokenthree.dkim.amazonses.com',
        status: 'success',
        purpose: VerificationRecordPurpose.DKIM,
        isRequired: true,
      },
    ]);
  });

  it('should publish the mail from MX and SPF records on the MAIL FROM domain registered in SES', () => {
    const records = buildAwsSesVerificationRecords({
      domain: 'acme.com',
      dkimTokens: [],
      dkimStatus: undefined,
      mailFromDomain: 'twenty-bounce2.acme.com',
      mailFromStatus: 'PENDING',
      region: 'us-east-1',
    });

    expect(records).toEqual([
      {
        type: 'MX',
        key: 'twenty-bounce2.acme.com',
        value: 'feedback-smtp.us-east-1.amazonses.com',
        priority: 10,
        status: 'pending',
        purpose: VerificationRecordPurpose.MAIL_FROM,
        isRequired: true,
      },
      {
        type: 'TXT',
        key: 'twenty-bounce2.acme.com',
        value: 'v=spf1 include:amazonses.com ~all',
        status: 'pending',
        purpose: VerificationRecordPurpose.MAIL_FROM,
        isRequired: true,
      },
    ]);
  });

  it('should report the mail from records as failed while DKIM is verified instead of copying the domain status', () => {
    const records = buildAwsSesVerificationRecords({
      domain: 'acme.com',
      dkimTokens: ['tokenone'],
      dkimStatus: 'SUCCESS',
      mailFromDomain: 'twenty-bounce.acme.com',
      mailFromStatus: 'FAILED',
      region: 'eu-central-1',
    });

    expect(records.map(({ purpose, status }) => ({ purpose, status }))).toEqual(
      [
        { purpose: VerificationRecordPurpose.DKIM, status: 'success' },
        { purpose: VerificationRecordPurpose.MAIL_FROM, status: 'error' },
        { purpose: VerificationRecordPurpose.MAIL_FROM, status: 'error' },
      ],
    );
  });
});
