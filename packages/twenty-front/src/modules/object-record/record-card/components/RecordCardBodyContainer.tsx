import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCardBodyContainer = styled.div<{ padding?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  padding: ${({ padding }) =>
    padding ??
    `0 ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]} 10px`};
`;

export { StyledCardBodyContainer as RecordCardBodyContainer };
