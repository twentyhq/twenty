import styled from '@emotion/styled';

export const DropdownMenuSubheader = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xxs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  text-transform: uppercase;
  width: 100%;
`;
