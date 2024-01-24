import { useRef } from 'react';
import styled from '@emotion/styled';
import { DragDropContext } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350

import { RecordBoardColumn } from '@/object-record/record-board/record-board-column/components/RecordBoardColumn';
import { RecordBoardScope } from '@/object-record/record-board/scopes/RecordBoardScope';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

export type RecordBoardProps = {
  recordBoardId: string;
};

const StyledContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex: 1;
  flex-direction: row;
  margin-left: ${({ theme }) => theme.spacing(2)};
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledBoardHeader = styled.div`
  position: relative;
  z-index: 1;
`;

export const RecordBoard = ({ recordBoardId }: RecordBoardProps) => {
  const boardRef = useRef<HTMLDivElement>(null);

  return (
    <RecordBoardScope
      recordBoardScopeId={recordBoardId}
      onColumnsChange={() => {}}
      onFieldsChange={() => {}}
    >
      <StyledWrapper>
        <StyledBoardHeader />
        <ScrollWrapper>
          <StyledContainer ref={boardRef}>
            <DragDropContext onDragEnd={() => {}}>
              {[].map((column) => (
                <RecordBoardColumn
                  key={'a'}
                  recordBoardColumnId={'a'}
                  columnDefinition={column}
                />
              ))}
            </DragDropContext>
          </StyledContainer>
        </ScrollWrapper>
        <DragSelect
          dragSelectable={boardRef}
          onDragSelectionChange={() => {}}
        />
      </StyledWrapper>
    </RecordBoardScope>
  );
};
