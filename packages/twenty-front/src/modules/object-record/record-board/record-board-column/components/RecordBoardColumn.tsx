import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { RECORD_BOARD_COLUMN_ACCENT_CSS_VARIABLE_NAMES } from '@/object-record/record-board/constants/RecordBoardColumnAccentCssVariableNames';
import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { getRecordBoardColumnAccentStyle } from '@/object-record/record-board/utils/getRecordBoardColumnAccentStyle';
import { RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-board/constants/RecordBoardColumnWidthCssVariableName';
import { RecordBoardColumnCardsContainer } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnCardsContainer';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useShouldHideRecordGroup } from '@/object-record/record-group/hooks/useShouldHideRecordGroup';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useDroppable } from '@dnd-kit/react';
import { pointerIntersection } from '@dnd-kit/collision';
import { RECORD_BOARD_CARD_DND_TYPE } from '@/object-record/record-board/record-board-dnd/constants/RecordBoardCardDndType';
import { RECORD_BOARD_COLUMN_DND_TYPE } from '@/object-record/record-board/record-board-dnd/constants/RecordBoardColumnDndType';
import { DND_KIT_COLLISION_PRIORITY } from '@/ui/utilities/drag-and-drop/constants/DndKitCollisionPriority';

const StyledColumn = styled.div`
  background-color: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  max-width: var(
    ${RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME},
    ${RECORD_BOARD_COLUMN_WIDTH}px
  );
  min-width: var(
    ${RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME},
    ${RECORD_BOARD_COLUMN_WIDTH}px
  );
  padding: 0 ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  position: relative;
`;

const StyledColumnPanel = styled.div`
  background-color: var(
    ${RECORD_BOARD_COLUMN_ACCENT_CSS_VARIABLE_NAMES.surface}
  );
  border-radius: 0 0 ${themeCssVariables.border.radius.md}
    ${themeCssVariables.border.radius.md};
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]} 0;
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

  const { ref } = useDroppable({
    id: recordBoardColumnId,
    collisionPriority: DND_KIT_COLLISION_PRIORITY,
    collisionDetector: pointerIntersection,
    type: RECORD_BOARD_COLUMN_DND_TYPE,
    accept: RECORD_BOARD_CARD_DND_TYPE,
  });

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
      <StyledColumn
        ref={ref}
        data-record-board-column-id={recordBoardColumnId}
        style={getRecordBoardColumnAccentStyle(recordGroupDefinition.color)}
      >
        <StyledColumnPanel>
          <RecordBoardColumnCardsContainer
            recordBoardColumnId={recordBoardColumnId}
          />
        </StyledColumnPanel>
      </StyledColumn>
    </RecordBoardColumnContext.Provider>
  );
};
