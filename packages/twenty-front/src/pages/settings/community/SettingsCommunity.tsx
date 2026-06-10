import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLabContent } from '@/settings/lab/components/SettingsLabContent';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import {
  H2Title,
  IconBriefcase,
  type IconComponent,
  IconMessage,
  IconTransform,
} from 'twenty-ui-deprecated/display';
import { Section } from 'twenty-ui-deprecated/layout';
import { ThemeContext } from 'twenty-ui-deprecated/theme-constants';

const StyledCardLink = styled.a`
  text-decoration: none;
`;

type SettingsCommunityLink = {
  title: string;
  description: string;
  href: string;
  Icon: IconComponent;
  cardTitle: string;
};

export const SettingsCommunity = () => {
  const { theme } = useContext(ThemeContext);

  const communityLinks: SettingsCommunityLink[] = [
    {
      title: t`Partners`,
      description: t`Hire a partner to help you implement and customize Twenty.`,
      href: 'https://twenty.com/partners/list',
      Icon: IconBriefcase,
      cardTitle: t`Browse partners`,
    },
    {
      title: t`Discord`,
      description: t`Join our community to get help and share feedback.`,
      href: 'https://discord.com/invite/cx5n4Jzs57',
      Icon: IconMessage,
      cardTitle: t`Join our Discord`,
    },
    {
      title: t`Releases`,
      description: t`Check out our latest releases`,
      href: 'https://twenty.com/releases',
      Icon: IconTransform,
      cardTitle: t`Read changelog`,
    },
  ];

  return (
    <SettingsPageLayout
      title={t`Community`}
      links={[{ children: t`Other` }, { children: t`Community` }]}
    >
      <SettingsPageContainer>
        {communityLinks.map(({ title, description, href, Icon, cardTitle }) => (
          <Section key={href}>
            <H2Title title={title} description={description} />
            <StyledCardLink
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SettingsCard
                Icon={
                  <Icon
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                }
                title={cardTitle}
              />
            </StyledCardLink>
          </Section>
        ))}

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
