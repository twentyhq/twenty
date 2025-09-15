import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';

import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { RecordCardHeader } from '@/object-record/record-card/components/RecordCardHeader';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type Dispatch, type SetStateAction, useContext } from 'react';
import { useRecoilValue } from 'recoil';

type RecordBoardCardHeaderProps = {
  isCardExpanded?: boolean;
  setIsCardExpanded?: Dispatch<SetStateAction<boolean>>;
};

export const RecordBoardCardHeader = ({
  isCardExpanded,
  setIsCardExpanded,
}: RecordBoardCardHeaderProps) => {
  const { recordId } = useContext(RecordBoardCardContext);

  const { objectMetadataItem, recordBoardId } = useContext(RecordBoardContext);
  const { rowIndex, columnIndex } = useContext(RecordBoardCardContext);
  const { activateBoardCard } = useActiveRecordBoardCard(recordBoardId);
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordBoardId);

  const showCompactView = useRecoilComponentValue(
    isRecordBoardCompactModeActiveComponentState,
  );

  const { checkIfLastUnselectAndCloseDropdown } =
    useRecordBoardSelection(recordBoardId);

  const [isCurrentCardSelected, setIsCurrentCardSelected] =
    useRecoilComponentFamilyState(
      isRecordBoardCardSelectedComponentFamilyState,
      recordId,
    );

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);

  return (
    <RecordCardHeader
      isCompactView={showCompactView}
      onTitleClick={() => {
        activateBoardCard({ rowIndex, columnIndex });
        unfocusBoardCard();
        openRecordFromIndexView({ recordId });
      }}
      onCompactIconClick={() => {
        setIsCardExpanded?.((prev) => !prev);
      }}
      onCheckboxChange={() => {
        setIsCurrentCardSelected(!isCurrentCardSelected);
        checkIfLastUnselectAndCloseDropdown();
      }}
      objectMetadataItem={objectMetadataItem}
      recordId={recordId}
      isCurrentCardSelected={isCurrentCardSelected}
      recordIndexOpenRecordIn={recordIndexOpenRecordIn}
      isCardExpanded={isCardExpanded}
    />
  );
};
