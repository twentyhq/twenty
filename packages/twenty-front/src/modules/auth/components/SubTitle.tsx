import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSubTitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  text-align: center;
`;

export { StyledSubTitle as SubTitle };
