import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsDiscoveryHeroCardFooter } from '@/settings/components/SettingsDiscoveryHeroCardFooter';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLayoutItemsStats } from '@/settings/layout/components/SettingsLayoutItemsStats';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconLayoutDashboard, IconPencil, IconSparkle2 } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';
import coverDark from '~/pages/settings/layout/assets/cover-dark.png';
import coverLight from '~/pages/settings/layout/assets/cover-light.png';

const SETTINGS_LAYOUT_HERO_INSTANCE_ID_PREFIX = 'settings-layout-hero';

export const SettingsLayout = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();

  const handleCustomize = () => {
    if (enterLayoutCustomizationMode()) {
      navigate(AppPath.Index);
    }
  };

  const heroTabs = [
    {
      id: 'layout_walkthrough',
      title: t`Walkthrough`,
      Icon: IconSparkle2,
      vimeoId: '1217964357',
      hasSound: true,
    },
  ];

  return (
    <SettingsPageLayout
      title={t`Layout`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`Layout` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsDiscoveryHeroCard
            lightSrc={coverLight}
            darkSrc={coverDark}
            instanceIdPrefix={SETTINGS_LAYOUT_HERO_INSTANCE_ID_PREFIX}
            tabs={heroTabs}
            playButtonAriaLabel={t`Watch customization demo`}
            footer={
              <SettingsDiscoveryHeroCardFooter
                Icon={IconLayoutDashboard}
                title={t`Customize layout`}
                description={t`Customize how your workspace looks.`}
                action={
                  <Button
                    title={t`Customize`}
                    variant="primary"
                    accent="blue"
                    size="small"
                    Icon={IconPencil}
                    onClick={handleCustomize}
                  />
                }
              />
            }
          />
        </Section>
        <Section>
          <H2Title
            title={t`Overview`}
            description={t`All the layout items declared on your workspace`}
          />
          <SettingsLayoutItemsStats />
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
