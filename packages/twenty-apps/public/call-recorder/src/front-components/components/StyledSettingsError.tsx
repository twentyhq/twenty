import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledSettingsError = styled.div`
  color: ${() => themeCssVariables.font.color.danger};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
  margin-top: ${() => themeCssVariables.spacing[1]};
`;
