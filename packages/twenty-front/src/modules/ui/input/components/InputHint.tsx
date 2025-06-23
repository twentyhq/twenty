import styled from '@emotion/styled';

const StyledInputHint = styled.div<{
  danger?: boolean;
}>`
  color: ${({ danger, theme }) =>
    danger ? theme.font.color.danger : theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

export { StyledInputHint as InputHint };
