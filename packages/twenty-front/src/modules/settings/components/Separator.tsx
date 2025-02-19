import styled from '@emotion/styled';

const StyledHr = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  margin: 0px;
  margin-left: ${({ theme }) => theme.spacing(4)};
  margin-right: ${({ theme }) => theme.spacing(4)};
`;

export const Separator = () => {
  return <StyledHr />;
};
