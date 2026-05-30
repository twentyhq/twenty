import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLayoutItemsStats } from '@/settings/layout/components/SettingsLayoutItemsStats';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  H2Title,
  IconAppWindow,
  IconCommand,
  IconLayoutDashboard,
  IconLayoutSidebarLeftExpand,
  IconPencil,
  IconTable,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import customizeIllustrationDark from '~/pages/settings/layout/assets/customize-illustration-dark.png';
import customizeIllustrationLight from '~/pages/settings/layout/assets/customize-illustration-light.png';

const SETTINGS_LAYOUT_HERO_INSTANCE_ID_PREFIX = 'settings-layout-hero';

export const SettingsLayout = () => {
  const { t } = useLingui();

  // Vimeo IDs are reused from twenty-docs' in-page demos. No video exists
  // yet for several of these tabs, so the closest topical match is used as
  // a placeholder — Sidebar/Record page share the Layout core-concepts demo.
  const heroTabs = useMemo(
    () => [
      {
        id: 'sidebar',
        title: t`Sidebar`,
        Icon: IconLayoutSidebarLeftExpand,
        vimeoId: '1185511790',
      },
      {
        id: 'record-page',
        title: t`Record page`,
        Icon: IconAppWindow,
        vimeoId: '1185511790',
      },
      {
        id: 'command-menu',
        title: t`Command menu`,
        Icon: IconCommand,
        vimeoId: '1185416775',
      },
      {
        id: 'views',
        title: t`Views`,
        Icon: IconTable,
        vimeoId: '1145648745',
      },
      {
        id: 'dashboards',
        title: t`Dashboards`,
        Icon: IconLayoutDashboard,
        vimeoId: '1185511768',
      },
    ],
    [t],
  );

  return (
    <SubMenuTopBarContainer
      title={t`Layout`}
      actionButton={
        <UndecoratedLink to={AppPath.Index}>
          <Button
            title={t`Customize`}
            variant="primary"
            accent="blue"
            size="small"
            Icon={IconPencil}
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`Layout` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsDiscoveryHeroCard
            lightSrc={customizeIllustrationLight}
            darkSrc={customizeIllustrationDark}
            instanceIdPrefix={SETTINGS_LAYOUT_HERO_INSTANCE_ID_PREFIX}
            tabs={heroTabs}
            playButtonAriaLabel={t`Watch customization demo`}
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
    </SubMenuTopBarContainer>
  );
};
