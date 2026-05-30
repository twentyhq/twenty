import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useScrollRestoration } from '@/ui/utilities/scroll/hooks/useScrollRestoration';
import { styled } from '@linaria/react';
import { type ReactNode, useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// The container fills its parent on desktop. The actual content cap is set
// upstream by SubMenuTopBarContainer's max-width wrapper (1024 px today), so
// cards, tables, and forms stretch the full width of the centered column
// rather than living in the old 512 px column tied to the previous centered
// settings layout. Pages can still pass an explicit `width` for a narrower
// form-style layout.
const StyledSettingsPageContainer = styled.div<{
  width?: number;
  isMobile?: boolean;
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  overflow: auto;
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
}: {
  children: ReactNode;
}) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const settingsPath = useMemo(() => {
    const sortedPaths = Object.values(SettingsPath).sort(
      (a, b) => b.length - a.length,
    );

    return sortedPaths.find((path) => {
      const settingsPath = getSettingsPath(path);
      const match = matchPath(settingsPath, location.pathname);
      return isDefined(match);
    });
  }, [location.pathname]);

  const componentInstanceId = `scroll-wrapper-settings-page-container-${settingsPath}`;

  useScrollRestoration(componentInstanceId);

  return (
    <ScrollWrapper componentInstanceId={componentInstanceId}>
      <StyledSettingsPageContainer isMobile={isMobile}>
        {children}
      </StyledSettingsPageContainer>
    </ScrollWrapper>
  );
};
