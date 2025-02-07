import styled from '@emotion/styled';

const StyledInputErrorHelper = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

export { StyledInputErrorHelper as InputErrorHelper };
