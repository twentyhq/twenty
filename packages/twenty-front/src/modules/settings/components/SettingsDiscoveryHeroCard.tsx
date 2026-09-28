import { type SettingsCustomizeVideoModalTab } from '@/settings/types/SettingsCustomizeVideoModalTab';
import { SettingsCustomizeVideoModal } from '@/settings/components/SettingsCustomizeVideoModal';
import { HeroPlayButton } from '@/ui/layout/hero/components/HeroPlayButton';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { Card } from 'twenty-ui/primitives/surfaces';
import { useThemeColorScheme, themeCssVariables } from 'twenty-ui/theme';

const DEFAULT_COVER_HEIGHT = 150;

const StyledCoverContainer = styled.div<{ coverHeight: number }>`
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  height: ${({ coverHeight }) => coverHeight}px;
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

const StyledFooter = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-top: 1px solid ${themeCssVariables.border.color.medium};
`;

type SettingsDiscoveryHeroCardProps = {
  lightSrc: string;
  darkSrc: string;
  instanceIdPrefix: string;
  tabs: SettingsCustomizeVideoModalTab[];
  coverHeight?: number;
  footer?: ReactNode;
  playButtonAriaLabel?: string;
};

export const SettingsDiscoveryHeroCard = ({
  lightSrc,
  darkSrc,
  instanceIdPrefix,
  tabs,
  coverHeight = DEFAULT_COVER_HEIGHT,
  footer,
  playButtonAriaLabel,
}: SettingsDiscoveryHeroCardProps) => {
  const { t } = useLingui();
  const colorScheme = useThemeColorScheme();
  const { openDialog } = useDialog();
  const shouldDisplayVideo = tabs.length > 0;

  const modalInstanceId = `${instanceIdPrefix}-modal`;
  const tabsInstanceId = `${instanceIdPrefix}-tabs`;

  const src = colorScheme === 'light' ? lightSrc : darkSrc;

  return (
    <>
      <Card.Root rounded>
        <StyledCoverContainer coverHeight={coverHeight}>
          <StyledImage src={src} alt="" aria-hidden />
          {shouldDisplayVideo && (
            <StyledOverlay>
              <HeroPlayButton
                onClick={() => openDialog(modalInstanceId)}
                ariaLabel={playButtonAriaLabel ?? t`Watch demo`}
              />
            </StyledOverlay>
          )}
        </StyledCoverContainer>
        {footer !== undefined && footer !== null && (
          <StyledFooter>{footer}</StyledFooter>
        )}
      </Card.Root>
      {shouldDisplayVideo && (
        <SettingsCustomizeVideoModal
          modalInstanceId={modalInstanceId}
          tabsInstanceId={tabsInstanceId}
          tabs={tabs}
        />
      )}
    </>
  );
};
