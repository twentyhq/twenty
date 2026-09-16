import { NavigationButton } from '@/ui/input/components/NavigationButton';

import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import DarkCoverImage from '@/settings/data-model/assets/cover-dark.png';
import LightCoverImage from '@/settings/data-model/assets/cover-light.png';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconEye, IconPlus, IconSparkle2 } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Section } from 'twenty-ui/primitives/layout';
import { H2Title } from 'twenty-ui/primitives/typography';
import { SettingsObjectTable } from '~/pages/settings/data-model/SettingsObjectTable';

const SETTINGS_DATA_MODEL_HERO_INSTANCE_ID_PREFIX = 'settings-data-model-hero';

export const SettingsObjects = () => {
  const { t } = useLingui();

  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const heroTabs = [
    {
      id: 'data_model_walkthrough',
      title: t`Walkthrough`,
      Icon: IconSparkle2,
      vimeoId: '1217964359',
      hasSound: true,
    },
  ];

  return (
    <SettingsPageLayout
      title={t`Data model`}
      actionButton={
        isDDLLocked ? (
          <Button
            startIcon={<IconPlus />}
            size="sm"
            disabled
            variant="solid"
            color="accent"
          >{t`Add object`}</Button>
        ) : (
          <NavigationButton
            to={getSettingsPath(SettingsPath.NewObject)}
            startIcon={<IconPlus />}
            size="sm"
            variant="solid"
            color="accent"
          >{t`Add object`}</NavigationButton>
        )
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`Objects` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsDiscoveryHeroCard
            lightSrc={LightCoverImage}
            darkSrc={DarkCoverImage}
            instanceIdPrefix={SETTINGS_DATA_MODEL_HERO_INSTANCE_ID_PREFIX}
            tabs={heroTabs}
            playButtonAriaLabel={t`Watch data model demo`}
          />
        </Section>
        <Section>
          <H2Title
            title={t`Objects`}
            description={t`Manage objects, fields and relationships`}
          />
          <SettingsObjectTable objectMetadataItems={objectMetadataItems} />
        </Section>
        <Section>
          <H2Title
            title={t`Visualize data model`}
            description={t`See your data structure as an interactive diagram`}
          />
          <NavigationButton
            to={getSettingsPath(SettingsPath.ObjectOverview)}
            size="md"
            startIcon={<IconEye />}
            variant="outline"
          >{t`Visualize`}</NavigationButton>
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
