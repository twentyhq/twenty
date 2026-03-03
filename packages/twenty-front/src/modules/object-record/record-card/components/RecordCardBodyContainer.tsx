import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCardBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-left: 10px;
  padding-right: ${themeCssVariables.spacing[2]};
  span {
    align-items: center;
    display: flex;
    flex-direction: row;
    svg {
      color: ${themeCssVariables.font.color.tertiary};
      margin-right: ${themeCssVariables.spacing[2]};
    }
  }
`;

export { StyledCardBodyContainer as RecordCardBodyContainer };
