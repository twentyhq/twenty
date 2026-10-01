import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledAuthContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  justify-content: center;
  padding: ${themeCssVariables.spacing[10]};
`;
