import { t } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';

import { type SettingsEmailingDomainVerificationRecord } from '@/settings/emailing-domains/types/SettingsEmailingDomainVerificationRecord';
import { type VerificationRecordGroupKey } from '@/settings/emailing-domains/types/VerificationRecordGroupKey';
import { getVerificationRecordEmailingDomainStatus } from '@/settings/emailing-domains/utils/getVerificationRecordEmailingDomainStatus';
import { EmailingDomainStatus } from '~/generated-metadata/graphql';
import { getColorByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusColor';
import { getTextByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusText';

type VerificationRecordGroupStatusDisplay = {
  label: string;
  color: ThemeColor;
};

const getUnverifiedGroupStatus = ({
  groupKey,
  recordStatuses,
}: {
  groupKey: VerificationRecordGroupKey;
  recordStatuses: EmailingDomainStatus[];
}): EmailingDomainStatus => {
  switch (groupKey) {
    case 'UNSUBSCRIBE':
      return EmailingDomainStatus.PENDING;
    default:
      return recordStatuses.includes(EmailingDomainStatus.FAILED)
        ? EmailingDomainStatus.FAILED
        : EmailingDomainStatus.PENDING;
  }
};

export const getVerificationRecordGroupStatusDisplay = ({
  groupKey,
  records,
}: {
  groupKey: VerificationRecordGroupKey;
  records: SettingsEmailingDomainVerificationRecord[];
}): VerificationRecordGroupStatusDisplay => {
  const recordStatuses = records.map((record) =>
    getVerificationRecordEmailingDomainStatus(record.status),
  );

  const isVerified = recordStatuses.every(
    (status) => status === EmailingDomainStatus.VERIFIED,
  );

  const isRequired = records.some((record) => record.isRequired !== false);

  if (!isRequired && !isVerified) {
    return { label: t`Not set`, color: 'gray' };
  }

  const groupStatus = isVerified
    ? EmailingDomainStatus.VERIFIED
    : getUnverifiedGroupStatus({ groupKey, recordStatuses });

  return {
    label: getTextByEmailingDomainStatus(groupStatus),
    color: getColorByEmailingDomainStatus(groupStatus),
  };
};
