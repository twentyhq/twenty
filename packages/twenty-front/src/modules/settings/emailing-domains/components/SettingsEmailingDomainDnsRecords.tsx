import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';

import { SettingsDnsRecordsTable } from '@/settings/components/SettingsDnsRecordsTable';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { VERIFICATION_RECORD_GROUP_DISPLAY_ORDER } from '@/settings/emailing-domains/constants/VerificationRecordGroupDisplayOrder';
import { getVerificationRecordGroupContent } from '@/settings/emailing-domains/utils/getVerificationRecordGroupContent';
import { getVerificationRecordGroupKey } from '@/settings/emailing-domains/utils/getVerificationRecordGroupKey';
import { getVerificationRecordGroupStatusDisplay } from '@/settings/emailing-domains/utils/getVerificationRecordGroupStatusDisplay';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { type EmailingDomain } from '~/generated-metadata/graphql';

type SettingsEmailingDomainDnsRecordsProps = {
  emailingDomain: Pick<
    EmailingDomain,
    'domain' | 'status' | 'unsubscribeHostnameStatus' | 'verificationRecords'
  >;
};

export const SettingsEmailingDomainDnsRecords = ({
  emailingDomain,
}: SettingsEmailingDomainDnsRecordsProps) => {
  const isMessageCampaignEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
  );

  const groups = VERIFICATION_RECORD_GROUP_DISPLAY_ORDER.filter(
    (groupKey) => groupKey !== 'UNSUBSCRIBE' || isMessageCampaignEnabled,
  )
    .map((groupKey) => ({
      id: groupKey,
      records: (emailingDomain.verificationRecords ?? []).filter(
        (record) =>
          getVerificationRecordGroupKey({
            recordName: record.key,
            domain: emailingDomain.domain,
          }) === groupKey,
      ),
      status: getVerificationRecordGroupStatusDisplay({
        groupKey,
        emailingDomain,
      }),
      ...getVerificationRecordGroupContent(groupKey),
    }))
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
