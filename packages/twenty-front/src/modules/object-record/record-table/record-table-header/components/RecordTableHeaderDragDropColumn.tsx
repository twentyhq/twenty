import { styled } from '@linaria/react';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui';

const StyledTh = styled.th<{ backgroundColor: string;}>`
  border-bottom: none;
  border-top: none;
	background: ${({ backgroundColor }) => backgroundColor};
`;

export const RecordTableHeaderDragDropColumn = () => {
	const { theme } = useContext(ThemeContext);
	
  return <StyledTh backgroundColor={theme.background.primary}></StyledTh>;
};
