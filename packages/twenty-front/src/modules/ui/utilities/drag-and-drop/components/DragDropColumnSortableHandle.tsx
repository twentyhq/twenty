import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { DragDropColumnSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropColumnSortableHandleRefContext';

const StyledSortableHandle = styled.div`
  height: 100%;
  min-width: 0;
  outline: none;
  width: auto;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -2px;
  }
`;

type DragDropColumnSortableHandleProps = {
  children: ReactNode;
};

export const DragDropColumnSortableHandle = ({
  children,
}: DragDropColumnSortableHandleProps) => {
  const sortableHandleRef = useContext(DragDropColumnSortableHandleRefContext);

  return (
    <StyledSortableHandle ref={sortableHandleRef}>
      {children}
    </StyledSortableHandle>
  );
};
