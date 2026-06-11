import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledSubTitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  text-align: center;
`;

export { StyledSubTitle as SubTitle };
