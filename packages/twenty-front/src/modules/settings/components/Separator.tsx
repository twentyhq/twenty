import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHr = styled.hr`
  border: none;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  margin: 0px;
  margin-left: ${themeCssVariables.spacing[4]};
  margin-right: ${themeCssVariables.spacing[4]};
`;

export const Separator = () => {
  return <StyledHr />;
};
