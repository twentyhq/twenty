import { css } from '@emotion/react';
import styled from '@emotion/styled';

const StyledInputHint = styled.div<{
  isError?: boolean;
}>`
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
  ${({ isError, theme }) =>
    isError &&
    css`
      color: ${isError ? theme.font.color.danger : theme.font.color.light};
    `}
`;

export { StyledInputHint as InputHint };
