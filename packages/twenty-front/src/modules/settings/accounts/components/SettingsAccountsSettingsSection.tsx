import styled from '@emotion/styled';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconCalendarEvent, IconMailCog } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledCardsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(6)};

  @media (max-width: ${MOBILE_VIEWPORT}pxF) {
    flex-direction: column;
  }
`;

export const SettingsAccountsSettingsSection = () => {
  const { t } = useLingui();
  const theme = useTheme();
  return (
    <Section>
      <H2Title
        title={t`Settings`}
        description={t`Configure your emails and calendar settings.`}
      />
      <StyledCardsContainer>
        <UndecoratedLink to={getSettingsPath(SettingsPath.AccountsEmails)}>
          <SettingsCard
            Icon={
              <IconMailCog
                size={theme.icon.size.lg}
                stroke={theme.icon.stroke.sm}
              />
            }
            title={t`Emails`}
            description={t`Set email visibility, manage your blocklist and more.`}
          />
        </UndecoratedLink>
        <UndecoratedLink to={getSettingsPath(SettingsPath.AccountsCalendars)}>
          <SettingsCard
            Icon={
              <IconCalendarEvent
                size={theme.icon.size.lg}
                stroke={theme.icon.stroke.sm}
              />
            }
            title={t`Calendar`}
            description={t`Configure and customize your calendar preferences.`}
          />
        </UndecoratedLink>
      </StyledCardsContainer>
    </Section>
  );
};
