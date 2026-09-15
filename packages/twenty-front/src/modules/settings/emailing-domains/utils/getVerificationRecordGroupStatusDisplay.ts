import { t } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';

import { type SettingsEmailingDomainVerificationRecord } from '@/settings/emailing-domains/types/SettingsEmailingDomainVerificationRecord';
import { getVerificationRecordEmailingDomainStatus } from '@/settings/emailing-domains/utils/getVerificationRecordEmailingDomainStatus';
import { EmailingDomainStatus } from '~/generated-metadata/graphql';
import { getColorByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusColor';
import { getTextByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusText';

type VerificationRecordGroupStatusDisplay = {
  label: string;
  color: ThemeColor;
};

export const getVerificationRecordGroupStatusDisplay = ({
  records,
  isRequired,
}: {
  records: SettingsEmailingDomainVerificationRecord[];
  isRequired: boolean;
}): VerificationRecordGroupStatusDisplay => {
  const recordStatuses = records.map((record) =>
    getVerificationRecordEmailingDomainStatus(record.status),
  );

  const isVerified = recordStatuses.every(
    (status) => status === EmailingDomainStatus.VERIFIED,
  );

  if (!isRequired && !isVerified) {
    return { label: t`Not set`, color: 'gray' };
  }

  const groupStatus = isVerified
    ? EmailingDomainStatus.VERIFIED
    : recordStatuses.includes(EmailingDomainStatus.FAILED)
      ? EmailingDomainStatus.FAILED
      : EmailingDomainStatus.PENDING;

  return {
    label: getTextByEmailingDomainStatus(groupStatus),
    color: getColorByEmailingDomainStatus(groupStatus),
  };
};
