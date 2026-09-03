import { AWS_SES_MAIL_FROM_SUBDOMAIN } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-mail-from-subdomain.constant';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';

type BuildAwsSesVerificationRecordsArgs = {
  domain: string;
  dkimTokens: string[];
  region: string;
};

const MAIL_FROM_MX_PRIORITY = 10;
const MAIL_FROM_SPF_VALUE = 'v=spf1 include:amazonses.com ~all';

export const buildAwsSesVerificationRecords = ({
  domain,
  dkimTokens,
  region,
}: BuildAwsSesVerificationRecordsArgs): VerificationRecord[] => {
  const mailFromDomain = `${AWS_SES_MAIL_FROM_SUBDOMAIN}.${domain}`;

  const dkimRecords: VerificationRecord[] = dkimTokens.map((token) => ({
    type: 'CNAME',
    key: `${token}._domainkey.${domain}`,
    value: `${token}.dkim.amazonses.com`,
  }));

  return [
    ...dkimRecords,
    {
      type: 'MX',
      key: mailFromDomain,
      value: `feedback-smtp.${region}.amazonses.com`,
      priority: MAIL_FROM_MX_PRIORITY,
    },
    {
      type: 'TXT',
      key: mailFromDomain,
      value: MAIL_FROM_SPF_VALUE,
    },
  ];
};
