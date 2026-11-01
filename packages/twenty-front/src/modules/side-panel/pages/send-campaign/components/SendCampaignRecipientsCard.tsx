import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  IconBellOff,
  IconCopy,
  IconForbid,
  IconMailX,
  IconSend,
  IconUserOff,
  IconUsersGroup,
} from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { SettingsListItemCardContent } from '@/settings/components/SettingsListItemCardContent';
import { type CampaignAudiencePreviewDto } from '~/generated-metadata/graphql';

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.regular};
`;

type SendCampaignRecipientsCardProps = {
  audiencePreview: CampaignAudiencePreviewDto;
  listName: string | null;
  topicName: string | null;
};

export const SendCampaignRecipientsCard = ({
  audiencePreview,
  listName,
  topicName,
}: SendCampaignRecipientsCardProps) => {
  const { formatNumber } = useNumberFormat();

  const exclusions = [
    {
      id: 'without-email',
      Icon: IconMailX,
      label: t`Without an email address`,
      count: audiencePreview.withoutEmail,
    },
    {
      id: 'duplicate-emails',
      Icon: IconCopy,
      label: t`Duplicate email addresses`,
      count: audiencePreview.duplicateEmails,
    },
    {
      id: 'hard-suppressed',
      Icon: IconForbid,
      label: t`Bounced or complained`,
      count: audiencePreview.hardSuppressed,
    },
    {
      id: 'globally-unsubscribed',
      Icon: IconUserOff,
      label: t`Unsubscribed from everything`,
      count: audiencePreview.globallyUnsubscribed,
    },
    {
      id: 'topic-unsubscribed',
      Icon: IconBellOff,
      label: isNonEmptyString(topicName)
        ? t`Opted out of ${topicName}`
        : t`Opted out of this topic`,
      count: audiencePreview.topicUnsubscribed,
    },
  ].filter(({ count }) => count > 0);

  return (
    <Card.Root fullWidth>
      <SettingsListItemCardContent
        LeftIcon={IconUsersGroup}
        label={isNonEmptyString(listName) ? t`In ${listName}` : t`In the list`}
        rightComponent={
          <StyledCount>
            {formatNumber(audiencePreview.totalMembers)}
          </StyledCount>
        }
        divider
      />
      {exclusions.map(({ id, Icon, label, count }) => (
        <SettingsListItemCardContent
          key={id}
          LeftIcon={Icon}
          label={label}
          rightComponent={<StyledCount>{formatNumber(-count)}</StyledCount>}
          divider
        />
      ))}
      <SettingsListItemCardContent
        LeftIcon={IconSend}
        label={t`Will get this email`}
        rightComponent={
          <StyledCount>{formatNumber(audiencePreview.sendable)}</StyledCount>
        }
      />
    </Card.Root>
  );
};
