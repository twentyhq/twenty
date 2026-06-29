import { type ReactNode, useContext } from 'react';
import { styled } from '@linaria/react';

import { RecordBoardColumnSortableHandleRefContext } from '@/object-record/record-board/record-board-column/dnd/context/RecordBoardColumnSortableHandleRefContext';

const StyledSortableHandle = styled.div`
  height: 100%;
  min-width: 0;
  outline: none;
`;

type RecordBoardColumnSortableHandleProps = {
  children: ReactNode;
};

export const RecordBoardColumnSortableHandle = ({
  children,
}: RecordBoardColumnSortableHandleProps) => {
  const sortableHandleRef = useContext(
    RecordBoardColumnSortableHandleRefContext,
  );

  return (
    <StyledSortableHandle ref={sortableHandleRef}>
      {children}
    </StyledSortableHandle>
  );
};
