import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  H2Title,
  IconEye,
  IconHierarchy2,
  IconLink,
  IconList,
  IconPlus,
} from 'twenty-ui-deprecated/display';
import { Button } from 'twenty-ui-deprecated/input';
import { Section } from 'twenty-ui-deprecated/layout';
import { UndecoratedLink } from 'twenty-ui-deprecated/navigation';
import DarkCoverImage from '@/settings/data-model/assets/cover-dark.png';
import LightCoverImage from '@/settings/data-model/assets/cover-light.png';
import { SettingsObjectTable } from '~/pages/settings/data-model/SettingsObjectTable';

const SETTINGS_DATA_MODEL_HERO_INSTANCE_ID_PREFIX = 'settings-data-model-hero';

export const SettingsObjects = () => {
  const { t } = useLingui();

  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const heroTabs = [
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
  ];

  return (
    <SettingsPageLayout
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
    </SettingsPageLayout>
  );
};
