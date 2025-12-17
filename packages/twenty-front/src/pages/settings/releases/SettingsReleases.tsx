import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLabContent } from '@/settings/lab/components/SettingsLabContent';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconTransform } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

const StyledCardLink = styled.a`
  text-decoration: none;
`;

export const SettingsReleases = () => {
  const theme = useTheme();

  return (
    <SubMenuTopBarContainer
      title={t`Updates`}
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.Releases),
        },
        { children: t`Updates` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Releases`}
            description={t`Check out our latest releases`}
          />
          <StyledCardLink
            href="https://twenty.com/releases"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SettingsCard
              Icon={
                <IconTransform
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              }
              title={t`Read changelog`}
            />
          </StyledCardLink>
        </Section>

        <Section>
          <H2Title
            title={t`Early access`}
            description={t`Try our upcoming features. Please note they are still in beta. We don't recommend using them for production use cases`}
          />
          <SettingsLabContent />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
