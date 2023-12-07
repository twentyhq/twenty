import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { SettingsNavigationCard } from '@/settings/components/SettingsNavigationCard';
import { IconCalendarEvent, IconMailCog } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';

const StyledCardsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsAccountsSettingsSection = () => {
  const navigate = useNavigate();

  return (
    <Section>
      <H2Title
        title="Settings"
        description="Configure your emails and calendar settings."
      />
      <StyledCardsContainer>
        <SettingsNavigationCard
          Icon={IconMailCog}
          title="Emails"
          onClick={() => navigate('/settings/accounts/emails')}
        >
          Set email visibility, manage your blocklist and more.
        </SettingsNavigationCard>
        <SettingsNavigationCard
          Icon={IconCalendarEvent}
          title="Calendar"
          disabled
          hasSoonPill
        >
          Configure and customize your calendar preferences.
        </SettingsNavigationCard>
      </StyledCardsContainer>
    </Section>
  );
};
