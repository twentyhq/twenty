import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLabContent } from '@/settings/lab/components/SettingsLabContent';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  H2Title,
  IconBriefcase,
  IconMessage,
  IconTransform,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme-constants';

const StyledCardLink = styled.a`
  text-decoration: none;
`;

export const SettingsCommunity = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <SettingsPageLayout
      title={t`Community`}
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.Community),
        },
        { children: t`Community` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Partners`}
            description={t`Hire a partner to help you implement and customize Twenty.`}
          />
          <StyledCardLink
            href="https://twenty.com/partners/list"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SettingsCard
              Icon={
                <IconBriefcase
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              }
              title={t`Browse partners`}
            />
          </StyledCardLink>
        </Section>

        <Section>
          <H2Title
            title={t`Discord`}
            description={t`Join our community to get help and share feedback.`}
          />
          <StyledCardLink
            href="https://discord.com/invite/cx5n4Jzs57"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SettingsCard
              Icon={
                <IconMessage
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              }
              title={t`Join our Discord`}
            />
          </StyledCardLink>
        </Section>

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
            description={t`Try our upcoming features. Note they are still in beta. Please bear with us and report any issues you find.`}
          />
          <SettingsLabContent />
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
