import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { SettingsLayoutCoverImage } from '@/settings/layout/components/SettingsLayoutCoverImage';
import {
  SETTINGS_LAYOUT_CUSTOMIZE_VIDEO_MODAL_ID,
  SettingsLayoutCustomizeVideoModal,
} from '@/settings/layout/components/SettingsLayoutCustomizeVideoModal';
import { SettingsLayoutItemsStats } from '@/settings/layout/components/SettingsLayoutItemsStats';
import { HeroPlayButton } from '@/ui/layout/hero/components/HeroPlayButton';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconLayout, IconPencil } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';

export const SettingsLayout = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { openModal } = useModal();

  const handleWatchVideo = () => {
    openModal(SETTINGS_LAYOUT_CUSTOMIZE_VIDEO_MODAL_ID);
  };

  const handleStartCustomizing = () => {
    navigate(AppPath.Index);
  };

  return (
    <SubMenuTopBarContainer
      title={t`Layout`}
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
          <H2Title
            title={t`Customize`}
            description={t`Customize your sidebar, commands and record pages`}
          />
          <Card rounded>
            <SettingsLayoutCoverImage
              overlay={
                <HeroPlayButton
                  onClick={handleWatchVideo}
                  ariaLabel={t`Watch customization demo`}
                />
              }
            />
            <SettingsOptionCardContentButton
              Icon={IconLayout}
              title={t`Customize layout`}
              description={t`Customize how your workspace look.`}
              Button={
                <Button
                  title={t`Customize`}
                  variant="primary"
                  accent="blue"
                  size="small"
                  Icon={IconPencil}
                  onClick={handleStartCustomizing}
                />
              }
            />
          </Card>
        </Section>
        <Section>
          <H2Title
            title={t`Manage`}
            description={t`All the layout items declared on your workspace`}
          />
          <SettingsLayoutItemsStats />
        </Section>
      </SettingsPageContainer>
      <SettingsLayoutCustomizeVideoModal />
    </SubMenuTopBarContainer>
  );
};
