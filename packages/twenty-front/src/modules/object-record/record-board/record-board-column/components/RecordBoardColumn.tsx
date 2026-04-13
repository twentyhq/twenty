import { styled } from '@linaria/react';
import { Droppable } from '@hello-pangea/dnd';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordBoardColumnCardsContainer } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardsContainer';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useShouldHideRecordGroup } from '@/object-record/record-group/hooks/useShouldHideRecordGroup';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { DragAndDropLibraryLegacyReRenderBreaker } from '@/ui/drag-and-drop/components/DragAndDropReRenderBreaker';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

const StyledColumn = styled.div`
  background-color: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  max-width: 200px;
  min-width: 200px;
  padding: ${themeCssVariables.spacing[2]};
  padding-top: 0px;
  position: relative;
`;

type RecordBoardColumnProps = {
  recordBoardColumnId: string;
  recordBoardColumnIndex: number;
};

export const RecordBoardColumn = ({
  recordBoardColumnId,
  recordBoardColumnIndex,
}: RecordBoardColumnProps) => {
  const recordGroupDefinition = useAtomFamilyStateValue(
    recordGroupDefinitionFamilyState,
    recordBoardColumnId,
  );
  const recordIndexRecordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordBoardColumnId,
  );

  const shouldHide = useShouldHideRecordGroup(recordBoardColumnId);

  if (shouldHide) {
    return null;
  }

  if (!isDefined(recordGroupDefinition)) {
    return null;
  }

  return (
    <RecordBoardColumnContext.Provider
      value={{
        columnDefinition: recordGroupDefinition,
        columnId: recordBoardColumnId,
        recordIds: recordIndexRecordIdsByGroup,
        columnIndex: recordBoardColumnIndex,
      }}
    >
      <Droppable droppableId={recordBoardColumnId} ignoreContainerClipping>
        {(droppableProvided) => (
          <StyledColumn
            ref={droppableProvided.innerRef}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...droppableProvided.droppableProps}
          >
            <DragAndDropLibraryLegacyReRenderBreaker
              memoizationId={recordBoardColumnId}
            >
              <RecordBoardColumnCardsContainer
                recordBoardColumnId={recordBoardColumnId}
              />
            </DragAndDropLibraryLegacyReRenderBreaker>
            {droppableProvided.placeholder}
          </StyledColumn>
        )}
      </Droppable>
    </RecordBoardColumnContext.Provider>
  );
};
