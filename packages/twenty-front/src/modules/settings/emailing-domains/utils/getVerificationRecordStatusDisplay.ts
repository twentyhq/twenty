import { t } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';

import { type SettingsEmailingDomainVerificationRecord } from '@/settings/emailing-domains/types/SettingsEmailingDomainVerificationRecord';
import { getVerificationRecordEmailingDomainStatus } from '@/settings/emailing-domains/utils/getVerificationRecordEmailingDomainStatus';
import { EmailingDomainStatus } from '~/generated-metadata/graphql';
import { getColorByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusColor';
import { getTextByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusText';

type VerificationRecordStatusDisplay = {
  label: string;
  color: ThemeColor;
};

export const getVerificationRecordStatusDisplay = (
  record: SettingsEmailingDomainVerificationRecord,
): VerificationRecordStatusDisplay => {
  const status = getVerificationRecordEmailingDomainStatus(record.status);

  if (record.isRequired === false && status !== EmailingDomainStatus.VERIFIED) {
    return { label: t`Not set`, color: 'gray' };
  }

  return {
    label: getTextByEmailingDomainStatus(status),
    color: getColorByEmailingDomainStatus(status),
  };
};
