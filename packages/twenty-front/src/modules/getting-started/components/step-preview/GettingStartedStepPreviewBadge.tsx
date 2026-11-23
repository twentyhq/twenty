import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledBadge = styled.div`
  align-items: center;
  backdrop-filter: blur(20px);
  background-color: ${themeCssVariables.background.transparent.secondary};
  border: 1px solid ${themeCssVariables.background.transparent.lighter};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  left: 50%;
  padding: ${themeCssVariables.spacing[2]};
  position: absolute;
  transform: translateX(-50%);
  z-index: 2;
`;

type GettingStartedStepPreviewBadgeProps = {
  top: number;
  children: ReactNode;
};

export const GettingStartedStepPreviewBadge = ({
  top,
  children,
}: GettingStartedStepPreviewBadgeProps) => (
  <StyledBadge style={{ top }}>{children}</StyledBadge>
);
