import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from 'twenty-shared/types';
import { Status } from 'twenty-ui/primitives/data-display';

import { SettingsDnsRecordsTable } from '@/settings/components/SettingsDnsRecordsTable';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { VERIFICATION_RECORD_GROUP_DISPLAY_ORDER } from '@/settings/emailing-domains/constants/VerificationRecordGroupDisplayOrder';
import { type SettingsEmailingDomainVerificationRecord } from '@/settings/emailing-domains/types/SettingsEmailingDomainVerificationRecord';
import { getVerificationRecordGroupContent } from '@/settings/emailing-domains/utils/getVerificationRecordGroupContent';
import { getVerificationRecordGroupKey } from '@/settings/emailing-domains/utils/getVerificationRecordGroupKey';
import { getVerificationRecordGroupStatusDisplay } from '@/settings/emailing-domains/utils/getVerificationRecordGroupStatusDisplay';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

type SettingsEmailingDomainDnsRecordsProps = {
  verificationRecords: SettingsEmailingDomainVerificationRecord[];
};

export const SettingsEmailingDomainDnsRecords = ({
  verificationRecords,
}: SettingsEmailingDomainDnsRecordsProps) => {
  const isMessageCampaignEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
  );

  const groups = VERIFICATION_RECORD_GROUP_DISPLAY_ORDER.filter(
    (groupKey) => groupKey !== 'UNSUBSCRIBE' || isMessageCampaignEnabled,
  )
    .map((groupKey) => {
      const records = verificationRecords.filter(
        (record) => getVerificationRecordGroupKey(record) === groupKey,
      );

      return {
        id: groupKey,
        records,
        status: getVerificationRecordGroupStatusDisplay({ groupKey, records }),
        ...getVerificationRecordGroupContent(groupKey),
      };
    })
    .filter(({ records }) => records.length > 0);

  if (groups.length === 0) {
    return null;
  }

  const tableRecords = groups.flatMap(({ records }) =>
    records.map((record) => ({
      type: record.type,
      key: record.key,
      value: isDefined(record.priority)
        ? `${record.priority} ${record.value}`
        : record.value,
    })),
  );

  return (
    <>
      <SettingsListCard
        items={groups}
        rounded
        getItemLabel={(group) => group.title}
        RowIconFn={(group) => group.Icon}
        RowRightComponent={({ item: group }) => (
          <Status color={group.status.color}>{group.status.label}</Status>
        )}
      />
      <SettingsDnsRecordsTable records={tableRecords} />
    </>
  );
};
