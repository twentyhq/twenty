import { styled } from '@linaria/react';

import { SettingsCard } from '@/settings/components/SettingsCard';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { IconCalendarEvent, IconMailCog } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledCardsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[6]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const StyledCardLinkSlot = styled.div`
  flex: 1 1 0;
  min-width: 0;
`;

export const SettingsAccountsSettingsSection = () => {
  const theme = useTheme();
  const { t } = useLingui();
  return (
    <Section.Root>
      <Section.Header
        title={t`Settings`}
        description={t`Configure your emails and calendar settings.`}
      />
      <StyledCardsContainer>
        <StyledCardLinkSlot>
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
        </StyledCardLinkSlot>
        <StyledCardLinkSlot>
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
        </StyledCardLinkSlot>
      </StyledCardsContainer>
    </Section.Root>
  );
};
