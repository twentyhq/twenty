import { styled } from '@linaria/react';
import { type ReactNode, useContext } from 'react';

import { RecordTableHeaderSortableHandleRefContext } from '@/object-record/record-table/record-table-header/dnd/context/RecordTableHeaderSortableHandleRefContext';

const StyledSortableHandle = styled.div`
  height: 100%;
  min-width: 0;
  outline: none;
`;

type RecordTableHeaderSortableHandleProps = {
  children: ReactNode;
};

export const RecordTableHeaderSortableHandle = ({
  children,
}: RecordTableHeaderSortableHandleProps) => {
  const sortableHandleRef = useContext(
    RecordTableHeaderSortableHandleRefContext,
  );

  return (
    <StyledSortableHandle ref={sortableHandleRef}>
      {children}
    </StyledSortableHandle>
  );
};
