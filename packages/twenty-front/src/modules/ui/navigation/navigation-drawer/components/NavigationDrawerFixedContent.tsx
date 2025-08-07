import { type ReactNode } from 'react';

import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import styled from '@emotion/styled';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledFixedContainer = styled.div<{
  isSettings?: boolean;
  isMobile?: boolean;
}>`
  ${({ isSettings, theme, isMobile }) =>
    isSettings
      ? `
  padding-left: ${theme.spacing(5)};
  padding-right: ${isMobile ? theme.spacing(5) : theme.spacing(8)};
`
      : ''}
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
