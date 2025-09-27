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

export const StyledExpressionLabel = styled(Label)<InputLabelProps>`
  display: block;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;
