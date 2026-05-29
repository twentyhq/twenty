import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectCoverImage } from '@/settings/data-model/objects/components/SettingsObjectCoverImage';
import {
  SETTINGS_DATA_MODEL_VISUALIZE_VIDEO_MODAL_ID,
  SettingsDataModelVisualizeVideoModal,
} from '@/settings/data-model/objects/components/SettingsDataModelVisualizeVideoModal';
import { HeroPlayButton } from '@/ui/layout/hero/components/HeroPlayButton';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconEye, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { SettingsObjectTable } from '~/pages/settings/data-model/SettingsObjectTable';

export const SettingsObjects = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { openModal } = useModal();

  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const handleWatchVideo = () => {
    openModal(SETTINGS_DATA_MODEL_VISUALIZE_VIDEO_MODAL_ID);
  };

  const handleVisualize = () => {
    navigate(getSettingsPath(SettingsPath.ObjectOverview));
  };

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
          <H2Title
            title={t`Shape your data`}
            description={t`Define objects, fields, and the relations between them`}
          />
          <Card rounded>
            <SettingsObjectCoverImage
              overlay={
                <HeroPlayButton
                  onClick={handleWatchVideo}
                  ariaLabel={t`Watch data model demo`}
                />
              }
            />
          </Card>
        </Section>
        <Section>
          <H2Title
            title={t`Existing objects`}
            adornment={
              <Button
                title={t`Visualize`}
                variant="secondary"
                size="small"
                Icon={IconEye}
                onClick={handleVisualize}
              />
            }
          />
          <SettingsObjectTable objectMetadataItems={objectMetadataItems} />
        </Section>
      </SettingsPageContainer>
      <SettingsDataModelVisualizeVideoModal />
    </SubMenuTopBarContainer>
  );
};
