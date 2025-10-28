import { OBJECT_SETTINGS_WIDTH } from '@/settings/data-model/constants/ObjectSettings';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useScrollRestoration } from '@/ui/utilities/scroll/hooks/useScrollRestoration';
import styled from '@emotion/styled';
import { type ReactNode, useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

const StyledSettingsPageContainer = styled.div<{
  width?: number;
}>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  overflow: auto;
  padding: ${({ theme }) => theme.spacing(6, 8, 8)};
  width: ${({ width }) => {
    if (isDefined(width)) {
      return width + 'px';
    }
    if (useIsMobile()) {
      return 'unset';
    }
    return OBJECT_SETTINGS_WIDTH + 'px';
  }};
  padding-bottom: ${({ theme }) => theme.spacing(20)};
`;

export const SettingsPageContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
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
      <StyledSettingsPageContainer>{children}</StyledSettingsPageContainer>
    </ScrollWrapper>
  );
};
