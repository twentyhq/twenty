import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useScrollRestoration } from '@/ui/utilities/scroll/hooks/useScrollRestoration';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const SETTINGS_CONTENT_MAX_WIDTH = 760;
const SETTINGS_PATHS_BY_LENGTH = Object.values(SettingsPath).sort(
  (a, b) => b.length - a.length,
);

const getMatchingSettingsPath = (pathname: string) =>
  SETTINGS_PATHS_BY_LENGTH.find((path) => {
    const settingsPath = getSettingsPath(path);
    const match = matchPath(settingsPath, pathname);

    return isDefined(match);
  });

const StyledSettingsPageContainer = styled.div<{
  width?: number;
  isMobile?: boolean;
  overflow?: 'auto' | 'visible';
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  margin: 0 auto;
  max-width: ${SETTINGS_CONTENT_MAX_WIDTH}px;
  overflow: ${({ overflow = 'auto' }) => overflow};
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]}
    ${themeCssVariables.spacing[8]};
  padding-bottom: ${themeCssVariables.spacing[20]};
  width: ${({ width, isMobile }) => {
    if (isDefined(width)) {
      return width + 'px';
    }
    if (isMobile) {
      return 'unset';
    }
    return '100%';
  }};
`;

export const SettingsPageContainer = ({
  children,
  overflow = 'auto',
}: {
  children: ReactNode;
  overflow?: 'auto' | 'visible';
}) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const settingsPath = getMatchingSettingsPath(location.pathname);

  const componentInstanceId = `scroll-wrapper-settings-page-container-${settingsPath}`;

  useScrollRestoration(componentInstanceId);

  return (
    <ScrollWrapper componentInstanceId={componentInstanceId}>
      <StyledSettingsPageContainer isMobile={isMobile} overflow={overflow}>
        {children}
      </StyledSettingsPageContainer>
    </ScrollWrapper>
  );
};
