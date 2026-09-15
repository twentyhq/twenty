import { isNonEmptyString } from '@sniptt/guards';

import { mapAwsSesRecordStatus } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/utils/map-aws-ses-record-status.util';
import { VerificationRecordPurpose } from 'src/engine/core-modules/emailing-domain/drivers/types/verification-record-purpose.type';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';

type BuildAwsSesVerificationRecordsArgs = {
  domain: string;
  dkimTokens: string[];
  dkimStatus: string | undefined;
  mailFromDomain: string | undefined;
  mailFromStatus: string | undefined;
  region: string;
};

const MAIL_FROM_MX_PRIORITY = 10;
const MAIL_FROM_SPF_VALUE = 'v=spf1 include:amazonses.com ~all';

export const buildAwsSesVerificationRecords = ({
  domain,
  dkimTokens,
  dkimStatus,
  mailFromDomain,
  mailFromStatus,
  region,
}: BuildAwsSesVerificationRecordsArgs): VerificationRecord[] => {
  const dkimRecordStatus = mapAwsSesRecordStatus(dkimStatus);

  const dkimRecords: VerificationRecord[] = dkimTokens.map((token) => ({
    type: 'CNAME',
    key: `${token}._domainkey.${domain}`,
    value: `${token}.dkim.amazonses.com`,
    status: dkimRecordStatus,
    purpose: VerificationRecordPurpose.DKIM,
    isRequired: true,
  }));

  if (!isNonEmptyString(mailFromDomain)) {
    return dkimRecords;
  }

  const mailFromRecordStatus = mapAwsSesRecordStatus(mailFromStatus);

  return [
    ...dkimRecords,
    {
      type: 'MX',
      key: mailFromDomain,
      value: `feedback-smtp.${region}.amazonses.com`,
      priority: MAIL_FROM_MX_PRIORITY,
      status: mailFromRecordStatus,
      purpose: VerificationRecordPurpose.MAIL_FROM,
      isRequired: true,
    },
    {
      type: 'TXT',
      key: mailFromDomain,
      value: MAIL_FROM_SPF_VALUE,
      status: mailFromRecordStatus,
      purpose: VerificationRecordPurpose.MAIL_FROM,
      isRequired: true,
    },
  ];
};
