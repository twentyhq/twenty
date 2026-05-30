import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  H2Title,
  IconEye,
  IconHierarchy2,
  IconLink,
  IconList,
  IconPlus,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import DarkCoverImage from '@/settings/data-model/assets/cover-dark.png';
import LightCoverImage from '@/settings/data-model/assets/cover-light.png';
import { SettingsObjectTable } from '~/pages/settings/data-model/SettingsObjectTable';

const SETTINGS_DATA_MODEL_HERO_MODAL_ID = 'settings-data-model-hero-modal';
const SETTINGS_DATA_MODEL_HERO_TABS_ID = 'settings-data-model-hero-tabs';

export const SettingsObjects = () => {
  const { t } = useLingui();

  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  // Vimeo IDs re-used from twenty-docs. Relations re-uses the data-model
  // core-concepts demo since no dedicated relations walkthrough exists yet.
  const heroTabs = useMemo(
    () => [
      {
        id: 'objects',
        title: t`Objects`,
        Icon: IconHierarchy2,
        vimeoId: '926288174',
      },
      {
        id: 'fields',
        title: t`Fields`,
        Icon: IconList,
        vimeoId: '927628219',
      },
      {
        id: 'relations',
        title: t`Relations`,
        Icon: IconLink,
        vimeoId: '1185511827',
      },
    ],
    [t],
  );

  return (
    <SubMenuTopBarContainer
      title={t`Data model`}
      actionButton={
        isDDLLocked ? (
          <Button
            Icon={IconPlus}
            title={t`Add object`}
            accent="blue"
            size="small"
            disabled
          />
        ) : (
          <UndecoratedLink to={getSettingsPath(SettingsPath.NewObject)}>
            <Button
              Icon={IconPlus}
              title={t`Add object`}
              accent="blue"
              size="small"
            />
          </UndecoratedLink>
        )
      }
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`Objects` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsDiscoveryHeroCard
            lightSrc={LightCoverImage.toString()}
            darkSrc={DarkCoverImage.toString()}
            modalInstanceId={SETTINGS_DATA_MODEL_HERO_MODAL_ID}
            tabsInstanceId={SETTINGS_DATA_MODEL_HERO_TABS_ID}
            tabs={heroTabs}
            playButtonAriaLabel={t`Watch data model demo`}
          />
        </Section>
        <Section>
          <H2Title
            title={t`Existing objects`}
            description={t`Manage objects, fields and relationships`}
          />
          <SettingsObjectTable objectMetadataItems={objectMetadataItems} />
        </Section>
        <Section>
          <H2Title
            title={t`Visualize data model`}
            description={t`See your data structure as an interactive diagram`}
          />
          <UndecoratedLink to={getSettingsPath(SettingsPath.ObjectOverview)}>
            <Button
              title={t`Visualize`}
              variant="secondary"
              size="small"
              Icon={IconEye}
            />
          </UndecoratedLink>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
