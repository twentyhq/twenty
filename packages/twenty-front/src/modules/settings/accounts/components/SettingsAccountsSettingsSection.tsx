import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { SettingsNavigationCard } from '@/settings/components/SettingsNavigationCard';
import { IconCalendarEvent, IconMailCog } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import useI18n from '@/ui/i18n/useI18n';
import { Section } from '@/ui/layout/section/components/Section';

const StyledCardsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsAccountsSettingsSection = () => {
  const { translate } = useI18n('translations');
  const navigate = useNavigate();

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
          onClick={() => navigate('/settings/accounts/emails')}
        >
          {translate('setEmailVisibilityManage')}
        </SettingsNavigationCard>
        {/*<SettingsNavigationCard*/}
        {/*  Icon={IconCalendarEvent}*/}
        {/*  title={translate('calendar')}*/}
        {/*  disabled*/}
        {/*  hasSoonPill*/}
        {/*>*/}
        {/*  {translate('configureAndCustomizeYourCalendarPreferences')}*/}
        {/*</SettingsNavigationCard>*/}
      </StyledCardsContainer>
    </Section>
  );
};
