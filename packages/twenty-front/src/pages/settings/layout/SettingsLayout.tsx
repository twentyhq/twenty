import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLayoutItemsStats } from '@/settings/layout/components/SettingsLayoutItemsStats';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
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
} from 'twenty-ui-deprecated/display';
import { Button } from 'twenty-ui-deprecated/input';
import { Section } from 'twenty-ui-deprecated/layout';
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
  ];

  return (
    <SettingsPageLayout
      title={t`Layout`}
      actionButton={
        <Button
          title={t`Customize`}
          variant="primary"
          accent="blue"
          size="small"
          Icon={IconPencil}
          onClick={handleCustomize}
        />
      }
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
