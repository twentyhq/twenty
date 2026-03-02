import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledControlContainer = styled.div<{ cursor: string }>`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: ${({ cursor }) => cursor};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  justify-content: space-between;
  padding: 0 ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export const SubMatchingSelectControlContainer = StyledControlContainer;
