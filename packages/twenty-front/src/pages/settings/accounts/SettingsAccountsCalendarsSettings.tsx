import { useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import {
  EventSettingsVisibilityValue,
  SettingsAccountsEventVisibilitySettingsCard,
} from '@/settings/accounts/components/SettingsAccountsCalendarVisibilitySettingsCard';
import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';
import { SettingsAccountsToggleSettingCard } from '@/settings/accounts/components/SettingsAccountsToggleSettingCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { IconRefresh, IconSettings, IconUser } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { mockedConnectedAccounts } from '~/testing/mock-data/accounts';

const StyledCardMedia = styled(SettingsAccountsCardMedia)`
  height: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsAccountsCalendarsSettings = () => {
  const theme = useTheme();
  const { accountUuid = '' } = useParams();
  const connectedAccount = mockedConnectedAccounts.find(
    ({ id }) => id === accountUuid,
  );

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            {
              children: 'Accounts',
              href: getSettingsPagePath(SettingsPath.Accounts),
            },
            {
              children: 'Calendars',
              href: getSettingsPagePath(SettingsPath.AccountsCalendars),
            },
            { children: connectedAccount?.handle || '' },
          ]}
        />
        <Section>
          <H2Title
            title="Event visibility"
            description="Define what will be visible to other users in your workspace"
          />
          <SettingsAccountsEventVisibilitySettingsCard
            value={EventSettingsVisibilityValue.Everything}
            onChange={() => {}}
          />
        </Section>
        <Section>
          <H2Title
            title="Contact auto-creation"
            description="Automatically create contacts for people you've participated in an event with."
          />
          <SettingsAccountsToggleSettingCard
            cardMedia={
              <StyledCardMedia>
                <IconUser
                  size={theme.icon.size.sm}
                  stroke={theme.icon.stroke.lg}
                />
              </StyledCardMedia>
            }
            title="Auto-creation"
            value={false}
            onToggle={() => {}}
          />
        </Section>
        <Section>
          <H2Title
            title="Synchronization"
            description="Past and future calendar events will automatically be synced to this workspace"
          />
          <SettingsAccountsToggleSettingCard
            cardMedia={
              <StyledCardMedia>
                <IconRefresh
                  size={theme.icon.size.sm}
                  stroke={theme.icon.stroke.lg}
                />
              </StyledCardMedia>
            }
            title="Sync events"
            value={false}
            onToggle={() => {}}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
