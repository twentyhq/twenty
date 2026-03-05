import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLabContent } from '@/settings/lab/components/SettingsLabContent';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconTransform } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
const StyledCardLink = styled.a`
  text-decoration: none;
`;

export const SettingsUpdates = () => {
  return (
    <SubMenuTopBarContainer
      title={t`Updates`}
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.Updates),
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
                  size={resolveThemeVariableAsNumber(
                    themeCssVariables.icon.size.md,
                  )}
                  stroke={resolveThemeVariableAsNumber(
                    themeCssVariables.icon.stroke.sm,
                  )}
                />
              }
              title={t`Read changelog`}
            />
          </StyledCardLink>
        </Section>

        <Section>
          <H2Title
            title={t`Early access`}
            description={t`Try our upcoming features. Note they are still in beta. Please bear with us and report any issues you find.`}
          />
          <SettingsLabContent />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
