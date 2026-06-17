import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLabContent } from '@/settings/lab/components/SettingsLabContent';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import {
  H2Title,
  IconBrandX,
  IconBriefcase,
  IconTransform,
  type IconComponent,
  useIcons,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  MOBILE_VIEWPORT,
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
import coverDark from '~/pages/settings/community/assets/cover-dark.png';
import coverLight from '~/pages/settings/community/assets/cover-light.png';

const SETTINGS_COMMUNITY_HERO_INSTANCE_ID_PREFIX = 'settings-community-hero';

const StyledCardLink = styled.a`
  display: block;
  min-width: 0;
  text-decoration: none;
`;

const StyledCardsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledFeaturesContent = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
`;

type SettingsCommunityLink = {
  href: string;
  Icon: IconComponent;
  iconColor: string;
  cardTitle: string;
};

export const SettingsCommunity = () => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const IconBrandDiscord = getIcon('IconBrandDiscord');

  const socialLinks: SettingsCommunityLink[] = [
    {
      href: 'https://discord.com/invite/cx5n4Jzs57',
      Icon: IconBrandDiscord,
      iconColor: themeCssVariables.color.blue9,
      cardTitle: t`Join our Discord`,
    },
    {
      href: 'https://x.com/twentycrm',
      Icon: IconBrandX,
      iconColor: themeCssVariables.font.color.primary,
      cardTitle: t`Follow us on X`,
    },
  ];

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
          <SettingsDiscoveryHeroCard
            lightSrc={coverLight}
            darkSrc={coverDark}
            instanceIdPrefix={SETTINGS_COMMUNITY_HERO_INSTANCE_ID_PREFIX}
            tabs={[]}
          />
        </Section>

        <Section>
          <H2Title
            title={t`Join the community`}
            description={t`Stay up to date with product news and community updates.`}
          />
          <StyledCardsGrid>
            {socialLinks.map(({ href, Icon, iconColor, cardTitle }) => (
              <StyledCardLink
                key={href}
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
                  iconColor={iconColor}
                  title={cardTitle}
                />
              </StyledCardLink>
            ))}
          </StyledCardsGrid>
        </Section>

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
            title={t`Features`}
            description={t`Try our upcoming features. Note they are still in beta. Please bear with us and report any issues you find.`}
          />
          <StyledFeaturesContent>
            <SettingsLabContent />
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
          </StyledFeaturesContent>
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
