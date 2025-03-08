import styled from '@emotion/styled';
import { Label } from 'twenty-ui';

export const StyledDropdownMenuSubheader = styled(Label)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  font-size: ${({ theme }) => theme.font.size.xxs};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  text-transform: uppercase;
  width: 100%;
`;
