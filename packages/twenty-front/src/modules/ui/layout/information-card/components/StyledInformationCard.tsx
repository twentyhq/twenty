import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledInformationCard = styled.div`
  backdrop-filter: blur(20px);
  background: ${themeCssVariables.background.transparent.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  max-width: calc(100vw - 16px);
  padding: ${themeCssVariables.spacing[2]};
  width: 300px;
  z-index: ${themeCssVariables.lastLayerZIndex};
`;
