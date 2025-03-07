import styled from '@emotion/styled';
import { Label } from 'twenty-ui';

const StyledInputLabel = styled(Label)`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const InputLabel = StyledInputLabel;