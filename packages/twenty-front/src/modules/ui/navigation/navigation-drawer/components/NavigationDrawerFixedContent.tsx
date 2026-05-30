import { type ReactNode } from 'react';

import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { styled } from '@linaria/react';
import { useIsMobile } from 'twenty-ui/utilities';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Mobile keeps the touch-friendly horizontal padding; on desktop the
// container is edge-to-edge and the child supplies any padding it needs.
// The previous "if isSettings → 20px/32px" branch was specific to the
// AdvancedSettingsToggle and bled onto the new tabs row in the settings
// drawer; that padding now lives next to its consumer.
const StyledFixedContainer = styled.div<{ isMobile?: boolean }>`
  padding-left: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[5] : '0'};
  padding-right: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[5] : '0'};
`;

export const NavigationDrawerFixedContent = ({
  children,
}: {
  children: ReactNode;
}) => {
  const isMobile = useIsMobile();

  return (
    <StyledFixedContainer isMobile={isMobile}>
      <NavigationDrawerSection>{children}</NavigationDrawerSection>
    </StyledFixedContainer>
  );
};
