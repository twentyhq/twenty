import { type ReactNode } from 'react';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { styled } from '@linaria/react';
import { useIsMobile } from 'twenty-ui/utilities';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFixedContainer = styled.div<{
  isSettings?: boolean;
  isMobile?: boolean;
}>`
  padding-left: ${({ isSettings }) =>
    isSettings ? themeCssVariables.spacing[5] : '0'};
  padding-right: ${({ isSettings, isMobile }) =>
    isSettings
      ? isMobile
        ? themeCssVariables.spacing[5]
        : themeCssVariables.spacing[8]
      : '0'};
`;
export const NavigationDrawerFixedContent = ({
  children,
}: {
  children: ReactNode;
}) => {
  const isSettingsDrawer = useIsSettingsDrawer();
  const isMobile = useIsMobile();

  return (
    <StyledFixedContainer isSettings={isSettingsDrawer} isMobile={isMobile}>
      <NavigationDrawerSection>{children}</NavigationDrawerSection>
    </StyledFixedContainer>
  );
};
