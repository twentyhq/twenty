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
import { SettingsPath } from '@/types/SettingsPath';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

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
