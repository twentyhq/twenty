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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <Section>
      <H2Title
        title={t('settings')}
        description={t('accountSettingsDescription')}
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
            title={t('emails')}
            description={t('emailsDescription')}
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
            title={t('calendar')}
            description={t('calendarDescription')}
          />
        </UndecoratedLink>
      </StyledCardsContainer>
    </Section>
  );
};
