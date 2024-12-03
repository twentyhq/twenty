import styled from '@emotion/styled';
import {
  H2Title,
  IconCalendarEvent,
  IconMailCog,
  MOBILE_VIEWPORT,
  Section,
  UndecoratedLink,
} from 'twenty-ui';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { useTheme } from '@emotion/react';

const StyledCardsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(6)};

  @media (max-width: ${MOBILE_VIEWPORT}pxF) {
    flex-direction: column;
  }
`;

export const SettingsAccountsSettingsSection = () => {
  const theme = useTheme();
  return (
    <Section>
      <H2Title
        title="Settings"
        description="Configure your emails and calendar settings."
      />
      <StyledCardsContainer>
        <UndecoratedLink to={getSettingsPagePath(SettingsPath.AccountsEmails)}>
          <SettingsCard
            Icon={
              <IconMailCog
                size={theme.icon.size.lg}
                stroke={theme.icon.stroke.sm}
              />
            }
            title="Emails"
            description="Set email visibility, manage your blocklist and more."
          />
        </UndecoratedLink>
        <UndecoratedLink
          to={getSettingsPagePath(SettingsPath.AccountsCalendars)}
        >
          <SettingsCard
            Icon={
              <IconCalendarEvent
                size={theme.icon.size.lg}
                stroke={theme.icon.stroke.sm}
              />
            }
            title="Calendar"
            description="Configure and customize your calendar preferences."
          />
        </UndecoratedLink>
      </StyledCardsContainer>
    </Section>
  );
};
