import styled from '@emotion/styled';
import { type HTMLAttributes } from 'react';
import { Label } from 'twenty-ui/display';

type InputLabelProps = HTMLAttributes<HTMLLabelElement> & {
  htmlFor?: string;
};

const StyledInputLabel = styled(Label)<InputLabelProps>`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const InputLabel = StyledInputLabel;
