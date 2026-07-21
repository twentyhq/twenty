import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { DragDropColumnSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropColumnSortableHandleRefContext';

const StyledSortableHandle = styled.div<{ $fill?: boolean }>`
  display: ${({ $fill }) => ($fill ? 'flex' : 'block')};
  height: 100%;
  min-width: 0;
  outline: none;
  width: ${({ $fill }) => ($fill ? '100%' : 'auto')};

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -2px;
  }
`;

type DragDropColumnSortableHandleProps = {
  children: ReactNode;
  fill?: boolean;
};

export const DragDropColumnSortableHandle = ({
  children,
  fill = false,
}: DragDropColumnSortableHandleProps) => {
  const sortableHandleRef = useContext(DragDropColumnSortableHandleRefContext);

  return (
    <StyledSortableHandle ref={sortableHandleRef} $fill={fill}>
      {children}
    </StyledSortableHandle>
  );
};
