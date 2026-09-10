import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { SettingsWorkspaceEmailChannelDomainStatusCell } from '@/settings/workspace/components/SettingsWorkspaceEmailChannelDomainStatusCell';
import { SettingsWorkspaceEmailGroupSourceCell } from '@/settings/workspace/components/SettingsWorkspaceEmailGroupSourceCell';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  MessageChannelType,
  SettingsPath,
} from 'twenty-shared/types';
import { IconMail } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledCardsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsWorkspaceEmailGroupSection = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const navigateSettings = useNavigateSettings();
  const { channels } = useMyMessageChannels();

  const isEmailGroupFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );

  const title = t`Channels`;
  const description = t`Addresses your workspace uses to send and receive email from shared inboxes`;

  if (!isEmailGroupFeatureEnabled) {
    return (
      <Section>
        <H2Title title={title} description={description} />
        <StyledCardsColumn>
          <SettingsCard
            Icon={
              <IconMail
                size={theme.icon.size.lg}
                stroke={theme.icon.stroke.md}
              />
            }
            title={t`Manage channels`}
            soon
          />
        </StyledCardsColumn>
      </Section>
    );
  }

  const emailGroupChannels = channels.filter(
    (channel) => channel.type === MessageChannelType.EMAIL_GROUP,
  );

  return (
    <SettingsTableListSection<MessageChannel>
      title={title}
      description={description}
      items={emailGroupChannels}
      columns={[
        { label: t`Email`, Cell: SettingsWorkspaceEmailGroupSourceCell },
        {
          label: t`Domain`,
          align: 'right',
          Cell: SettingsWorkspaceEmailChannelDomainStatusCell,
        },
      ]}
      gridAutoColumns="1fr 1fr"
      showRowChevron
      onRowClick={(channel) =>
        navigateSettings(SettingsPath.EmailGroupChannelDetail, {
          messageChannelId: channel.id,
        })
      }
      footerButtonLabel={t`Add email channel`}
      onFooterButtonClick={() =>
        navigateSettings(SettingsPath.NewEmailGroupChannel)
      }
    />
  );
};
