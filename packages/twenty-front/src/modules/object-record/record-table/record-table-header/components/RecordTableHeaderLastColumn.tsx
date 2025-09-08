import styled from '@emotion/styled';

const StyledLastColumnHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  background-color: ${({ theme }) => theme.background.primary};
  border-left: none !important;
  color: ${({ theme }) => theme.font.color.tertiary};

  width: fit-content;
  height: 32px;
  max-height: 32px;
`;

export const RecordTableHeaderLastColumn = () => {
  return (
    <StyledLastColumnHeader className="header-cell"></StyledLastColumnHeader>
  );
};
