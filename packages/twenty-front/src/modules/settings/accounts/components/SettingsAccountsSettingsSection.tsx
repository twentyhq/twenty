import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { SettingsNavigationCard } from '@/settings/components/SettingsNavigationCard';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { IconCalendarEvent, IconMailCog } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import useI18n from '@/ui/i18n/useI18n';
import { Section } from '@/ui/layout/section/components/Section';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

const StyledCardsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsAccountsSettingsSection = () => {
  const { translate } = useI18n('translations');
  const navigate = useNavigate();
  const isCalendarEnabled = useIsFeatureEnabled('IS_CALENDAR_ENABLED');

  return (
    <Section>
      <H2Title
        title={translate('settings')}
        description={translate('configureYourEmailsAndCalendarSettings')}
      />
      <StyledCardsContainer>
        <SettingsNavigationCard
          Icon={IconMailCog}
          title={translate('emails')}
          onClick={() =>
            navigate(getSettingsPagePath(SettingsPath.AccountsEmails))
          }
        >
          {translate('setEmailVisibilityManage')}
        </SettingsNavigationCard>
        <SettingsNavigationCard
          Icon={IconCalendarEvent}
          title={translate('calendar')}
          soon={!isCalendarEnabled}
          onClick={() =>
            navigate(getSettingsPagePath(SettingsPath.AccountsCalendars))
          }
        >
          {translate('configureAndCustomizeYourCalendarPreferences')}
        </SettingsNavigationCard>
      </StyledCardsContainer>
    </Section>
  );
};
