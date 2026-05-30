import {
  SettingsCustomizeVideoModal,
  type SettingsCustomizeVideoModalTab,
} from '@/settings/components/SettingsCustomizeVideoModal';
import { HeroPlayButton } from '@/ui/layout/hero/components/HeroPlayButton';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Card } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

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
  // Theme-aware illustration sources. Both required so the hero adapts.
  lightSrc: string;
  darkSrc: string;
  // Unique per page so different heroes don't share modal state.
  modalInstanceId: string;
  tabsInstanceId: string;
  tabs: SettingsCustomizeVideoModalTab[];
  playButtonAriaLabel?: string;
};

// One-stop hero card for settings discovery pages.
// Card frame + cover illustration + centered play button + tabbed video modal,
// all wired together. Each page just provides its illustration sources, a
// unique modal id, and the per-tab video config — no per-page wrapper files,
// no copy-pasted Card/HeroPlayButton/modal plumbing.
export const SettingsDiscoveryHeroCard = ({
  lightSrc,
  darkSrc,
  modalInstanceId,
  tabsInstanceId,
  tabs,
  playButtonAriaLabel,
}: SettingsDiscoveryHeroCardProps) => {
  const { t } = useLingui();
  const { colorScheme } = useContext(ThemeContext);
  const { openModal } = useModal();

  const src = colorScheme === 'light' ? lightSrc : darkSrc;

  return (
    <>
      <Card rounded>
        <StyledCoverContainer>
          <StyledImage src={src} alt="" aria-hidden />
          <StyledOverlay>
            <HeroPlayButton
              onClick={() => openModal(modalInstanceId)}
              ariaLabel={playButtonAriaLabel ?? t`Watch demo`}
            />
          </StyledOverlay>
        </StyledCoverContainer>
      </Card>
      <SettingsCustomizeVideoModal
        modalInstanceId={modalInstanceId}
        tabsInstanceId={tabsInstanceId}
        tabs={tabs}
      />
    </>
  );
};
