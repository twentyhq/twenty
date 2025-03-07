import styled from '@emotion/styled';
import { Label } from 'twenty-ui';

const StyledInputHint = styled(Label)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

export { StyledInputHint as InputHint };
