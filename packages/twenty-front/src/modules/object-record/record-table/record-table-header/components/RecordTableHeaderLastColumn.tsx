import styled from '@emotion/styled';

const StyledLastColumnHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  background-color: ${({ theme }) => theme.background.primary};
  border-left: none !important;
  color: ${({ theme }) => theme.font.color.tertiary};

  width: 100%;
  height: 32px;
`;

export const RecordTableHeaderLastColumn = () => {
  return <StyledLastColumnHeader></StyledLastColumnHeader>;
};
