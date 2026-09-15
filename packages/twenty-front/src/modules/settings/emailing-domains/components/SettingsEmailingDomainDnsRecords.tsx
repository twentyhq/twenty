import { useLingui } from '@lingui/react/macro';
import { Fragment } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';
import { Section } from 'twenty-ui/primitives/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { H2Title } from 'twenty-ui/primitives/typography';

import { Separator } from '@/settings/components/Separator';
import { SettingsEmailingDomainDnsRecordGroup } from '@/settings/emailing-domains/components/SettingsEmailingDomainDnsRecordGroup';
import { VERIFICATION_RECORD_GROUP_DISPLAY_ORDER } from '@/settings/emailing-domains/constants/VerificationRecordGroupDisplayOrder';
import { type SettingsEmailingDomainVerificationRecord } from '@/settings/emailing-domains/types/SettingsEmailingDomainVerificationRecord';
import { getVerificationRecordGroupKey } from '@/settings/emailing-domains/utils/getVerificationRecordGroupKey';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

type SettingsEmailingDomainDnsRecordsProps = {
  verificationRecords: SettingsEmailingDomainVerificationRecord[];
};

export const SettingsEmailingDomainDnsRecords = ({
  verificationRecords,
}: SettingsEmailingDomainDnsRecordsProps) => {
  const { t } = useLingui();
  const isMessageCampaignEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
  );

  const groups = VERIFICATION_RECORD_GROUP_DISPLAY_ORDER.filter(
    (groupKey) => groupKey !== 'UNSUBSCRIBE' || isMessageCampaignEnabled,
  )
    .map((groupKey) => ({
      groupKey,
      records: verificationRecords.filter(
        (record) => getVerificationRecordGroupKey(record) === groupKey,
      ),
    }))
    .filter(({ records }) => records.length > 0);

  if (groups.length === 0) {
    return null;
  }

  return (
    <Section>
      <H2Title
        title={t`DNS records`}
        description={t`Add these records at your DNS provider. Twenty checks them automatically.`}
      />
      <Card rounded fullWidth>
        {groups.map(({ groupKey, records }, index) => (
          <Fragment key={groupKey}>
            {index > 0 && <Separator />}
            <SettingsEmailingDomainDnsRecordGroup
              groupKey={groupKey}
              records={records}
            />
          </Fragment>
        ))}
      </Card>
    </Section>
  );
};
