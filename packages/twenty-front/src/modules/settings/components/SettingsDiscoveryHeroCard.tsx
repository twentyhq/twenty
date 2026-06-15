import {
  SettingsCustomizeVideoModal,
  type SettingsCustomizeVideoModalTab,
} from '@/settings/components/SettingsCustomizeVideoModal';
import { HeroPlayButton } from '@/ui/layout/hero/components/HeroPlayButton';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Card } from 'twenty-ui/layout';
import {
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const COVER_HEIGHT = 150;

const StyledCoverContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  height: ${COVER_HEIGHT}px;
  overflow: hidden;
  position: relative;
`;

const StyledImage = styled.img`
  display: block;
  height: 100%;
  inset: 0;
  object-fit: cover;
  object-position: center top;
  position: absolute;
  width: 100%;
`;

const StyledOverlay = styled.div`
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  position: absolute;
`;

type SettingsDiscoveryHeroCardProps = {
  lightSrc: string;
  darkSrc: string;
  instanceIdPrefix: string;
  tabs: SettingsCustomizeVideoModalTab[];
  playButtonAriaLabel?: string;
};

export const SettingsDiscoveryHeroCard = ({
  lightSrc,
  darkSrc,
  instanceIdPrefix,
  tabs,
  playButtonAriaLabel,
}: SettingsDiscoveryHeroCardProps) => {
  const { t } = useLingui();
  const { colorScheme } = useContext(ThemeContext);
  const { openModal } = useModal();
  const isDiscoveryVideoEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_SETTINGS_DISCOVERY_HERO_ENABLED,
  );

  const modalInstanceId = `${instanceIdPrefix}-modal`;
  const tabsInstanceId = `${instanceIdPrefix}-tabs`;

  const src = colorScheme === 'light' ? lightSrc : darkSrc;

  return (
    <>
      <Card rounded>
        <StyledCoverContainer>
          <StyledImage src={src} alt="" aria-hidden />
          {isDiscoveryVideoEnabled && (
            <StyledOverlay>
              <HeroPlayButton
                onClick={() => openModal(modalInstanceId)}
                ariaLabel={playButtonAriaLabel ?? t`Watch demo`}
              />
            </StyledOverlay>
          )}
        </StyledCoverContainer>
      </Card>
      {isDiscoveryVideoEnabled && (
        <SettingsCustomizeVideoModal
          modalInstanceId={modalInstanceId}
          tabsInstanceId={tabsInstanceId}
          tabs={tabs}
        />
      )}
    </>
  );
};
