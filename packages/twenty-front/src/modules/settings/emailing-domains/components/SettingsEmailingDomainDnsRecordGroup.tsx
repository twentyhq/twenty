import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Pill, Status } from 'twenty-ui/primitives/data-display';
import { IconChevronDown, IconChevronRight } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/primitives/input';
import { AnimatedExpandableContainer } from 'twenty-ui/primitives/layout';
import { CardContent } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsDnsRecordsTable } from '@/settings/components/SettingsDnsRecordsTable';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { type SettingsEmailingDomainVerificationRecord } from '@/settings/emailing-domains/types/SettingsEmailingDomainVerificationRecord';
import { type VerificationRecordGroupKey } from '@/settings/emailing-domains/types/VerificationRecordGroupKey';
import { getVerificationRecordGroupContent } from '@/settings/emailing-domains/utils/getVerificationRecordGroupContent';
import { getVerificationRecordGroupStatusDisplay } from '@/settings/emailing-domains/utils/getVerificationRecordGroupStatusDisplay';
import { getVerificationRecordStatusDisplay } from '@/settings/emailing-domains/utils/getVerificationRecordStatusDisplay';

type SettingsEmailingDomainDnsRecordGroupProps = {
  groupKey: VerificationRecordGroupKey;
  records: SettingsEmailingDomainVerificationRecord[];
};

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsEmailingDomainDnsRecordGroup = ({
  groupKey,
  records,
}: SettingsEmailingDomainDnsRecordGroupProps) => {
  const { t } = useLingui();

  const isRequired = records.some((record) => record.isRequired !== false);
  const isCampaignGroup = groupKey === 'UNSUBSCRIBE';
  const { Icon, title, description } =
    getVerificationRecordGroupContent(groupKey);
  const groupStatus = getVerificationRecordGroupStatusDisplay({
    records,
    isRequired,
  });

  const [isExpanded, setIsExpanded] = useState(
    isRequired && !groupStatus.isVerified && !isCampaignGroup,
  );

  const requirementLabel = isCampaignGroup
    ? t`Campaigns`
    : isRequired
      ? t`Required`
      : t`Optional`;

  const tableRecords = records.map((record) => {
    const { label, color } = getVerificationRecordStatusDisplay(record);

    return {
      type: record.type,
      key: record.key,
      value: record.value,
      priority: record.priority,
      status: label,
      statusColor: color,
    };
  });

  return (
    <>
      <SettingsOptionCardContentButton
        Icon={Icon}
        title={
          <>
            {title} <Pill label={requirementLabel} />
          </>
        }
        description={description}
        Button={
          <StyledRowRightContainer>
            <Status color={groupStatus.color}>{groupStatus.label}</Status>
            <LightIconButton
              Icon={isExpanded ? IconChevronDown : IconChevronRight}
              accent="tertiary"
              onClick={() => setIsExpanded((currentValue) => !currentValue)}
            />
          </StyledRowRightContainer>
        }
      />
      <AnimatedExpandableContainer isExpanded={isExpanded}>
        <CardContent>
          <SettingsDnsRecordsTable records={tableRecords} />
        </CardContent>
      </AnimatedExpandableContainer>
    </>
  );
};
