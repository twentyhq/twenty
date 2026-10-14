import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledSettingsFigureList = styled.ul`
  color: ${() => themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  list-style: none;
  margin: 0;
  padding: 0;
`;
