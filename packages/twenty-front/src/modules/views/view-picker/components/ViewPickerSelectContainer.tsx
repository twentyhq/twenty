import styled from '@emotion/styled';

const StyledSelectContainer = styled.div`
  display: flex;
  width: calc(100% - ${({ theme }) => theme.spacing(2)});
  margin: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.light};
  user-select: none;
`;

export { StyledSelectContainer as ViewPickerSelectContainer };
