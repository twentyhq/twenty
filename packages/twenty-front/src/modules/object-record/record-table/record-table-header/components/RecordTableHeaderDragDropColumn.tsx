import { styled } from '@linaria/react';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme';

const StyledTh = styled.div<{ backgroundColor: string }>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  min-width: 17px;
  min-height: 100%;

  border-bottom: 1px solid ${({ backgroundColor }) => backgroundColor};
`;

export const RecordTableHeaderDragDropColumn = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledTh
      className="header-cell"
      backgroundColor={theme.background.primary}
    ></StyledTh>
  );
};
