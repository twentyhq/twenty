import { type ReactNode, useContext } from 'react';
import { styled } from '@linaria/react';

import { RecordBoardColumnSortableHandleRefContext } from '@/object-record/record-board/record-board-column/dnd/context/RecordBoardColumnSortableHandleRefContext';

const StyledSortableHandle = styled.div`
  display: flex;
  height: 100%;
  min-width: 0;
  width: 100%;
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
