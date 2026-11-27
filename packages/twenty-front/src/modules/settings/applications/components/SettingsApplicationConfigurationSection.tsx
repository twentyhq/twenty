import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { SettingsCard } from '@/settings/components/SettingsCard';

export type SettingsApplicationConfigurationLink = {
  id: string;
  title: string;
  Icon?: IconComponent;
  to: string;
};

type SettingsApplicationConfigurationSectionProps = {
  applicationName: string;
  links: SettingsApplicationConfigurationLink[];
};

const StyledLinkCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

export const SettingsApplicationConfigurationSection = ({
  applicationName,
  links,
}: SettingsApplicationConfigurationSectionProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <Section.Root>
      <Section.Header
        title={t`Configuration`}
        description={t`Set up ${applicationName} for your workspace`}
      />
      <StyledLinkCardsContainer>
        {links.map(({ id, title, Icon, to }) => (
          <SettingsCard
            key={id}
            to={to}
            Icon={
              isDefined(Icon) ? <Icon size={theme.icon.size.md} /> : undefined
            }
            title={title}
          />
        ))}
      </StyledLinkCardsContainer>
    </Section.Root>
  );
};
