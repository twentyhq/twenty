import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledSettingsText = styled.p`
  color: ${() => themeCssVariables.font.color.secondary};
  line-height: ${() => themeCssVariables.text.lineHeight.lg};
  margin: 0;
`;
