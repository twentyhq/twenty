import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Fragment } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { RecordBoardColumnNewRecordButton } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewRecordButton';
import { RecordBoardColumnLoadingSkeletonCards } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnLoadingSkeletonCards';
import { isRecordBoardCellsNonEditableComponentState } from '@/object-record/record-board/states/isRecordBoardCellsNonEditableComponentState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { DragDropItemDropTarget } from '@/ui/utilities/drag-and-drop/components/DragDropItemDropTarget';
import { RecordBoardCardContextProvider } from '@/object-record/record-board/record-board-card/components/RecordBoardCardContextProvider';

const StyledColumnCardsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledNewButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: ${themeCssVariables.spacing[2]};

  & > button {
    justify-content: flex-start;
  }
`;

const StyledEmptyColumnPlaceholder = styled.div`
  align-items: center;
  border: 1px dashed ${themeCssVariables.border.color.strong};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  justify-content: center;
  margin-bottom: ${themeCssVariables.spacing[2]};
  min-height: 72px;
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

type RecordBoardColumnCardsContainerProps = {
  recordBoardColumnId: string;
};

export const RecordBoardColumnCardsContainer = ({
  recordBoardColumnId,
}: RecordBoardColumnCardsContainerProps) => {
  const recordIndexRecordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordBoardColumnId,
  );

  const recordBoardShouldFetchMoreInColumn = useAtomComponentFamilyStateValue(
    recordBoardShouldFetchMoreInColumnComponentFamilyState,
    recordBoardColumnId,
  );

  const recordIndexRecordGroupsAreInInitialLoading = useAtomComponentStateValue(
    recordIndexRecordGroupsAreInInitialLoadingComponentState,
  );

  const isRecordBoardCellsNonEditable = useAtomComponentStateValue(
    isRecordBoardCellsNonEditableComponentState,
  );

  const isColumnEmpty =
    recordIndexRecordIdsByGroup.length === 0 &&
    !recordBoardShouldFetchMoreInColumn &&
    !recordIndexRecordGroupsAreInInitialLoading;

  return (
    <StyledColumnCardsContainer data-replay-ignore-mutations="true">
      {recordIndexRecordIdsByGroup.map((recordId, index) => (
        <Fragment key={recordId}>
          <DragDropItemDropTarget
            index={index}
            droppableId={recordBoardColumnId}
            orientation="horizontal"
            compact
          />
          <RecordBoardCardContextProvider
            recordId={recordId}
            rowIndex={index}
            group={recordBoardColumnId}
          />
        </Fragment>
      ))}
      {recordBoardShouldFetchMoreInColumn ? (
        <RecordBoardColumnLoadingSkeletonCards />
      ) : null}
      <DragDropItemDropTarget
        index={recordIndexRecordIdsByGroup.length}
        droppableId={recordBoardColumnId}
        orientation="horizontal"
        compact
      />
      {isColumnEmpty && (
        <StyledEmptyColumnPlaceholder>
          {isRecordBoardCellsNonEditable ? t`No records` : t`Drag records here`}
        </StyledEmptyColumnPlaceholder>
      )}
      <StyledNewButtonContainer>
        <RecordBoardColumnNewRecordButton />
      </StyledNewButtonContainer>
    </StyledColumnCardsContainer>
  );
};
