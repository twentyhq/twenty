import { RecordBoardContext } from '@/object-recordStore/recordStore-board/contexts/RecordBoardContext';
import { useRecordBoardSelection } from '@/object-recordStore/recordStore-board/hooks/useRecordBoardSelection';
import { RecordBoardCardContext } from '@/object-recordStore/recordStore-board/recordStore-board-card/contexts/RecordBoardCardContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-recordStore/recordStore-board/states/isRecordBoardCardSelectedComponentFamilyState';

import { RecordChip } from '@/object-recordStore/components/RecordChip';
import { useActiveRecordBoardCard } from '@/object-recordStore/recordStore-board/hooks/useActiveRecordBoardCard';
import { useFocusedRecordBoardCard } from '@/object-recordStore/recordStore-board/hooks/useFocusedRecordBoardCard';
import { StopPropagationContainer } from '@/object-recordStore/recordStore-board/recordStore-board-card/components/StopPropagationContainer';
import { recordBoardCardIsExpandedComponentState } from '@/object-recordStore/recordStore-board/recordStore-board-card/states/recordBoardCardIsExpandedComponentState';
import { RecordCardHeaderContainer } from '@/object-recordStore/recordStore-card/components/RecordCardHeaderContainer';
import { useOpenRecordFromIndexView } from '@/object-recordStore/recordStore-index/hooks/useOpenRecordFromIndexView';
import { recordIndexOpenRecordInState } from '@/object-recordStore/recordStore-index/states/recordIndexOpenRecordInState';
import { recordStoreFamilyState } from '@/object-recordStore/recordStore-store/states/recordStoreFamilyState';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ChipVariant } from 'twenty-ui/components';
import { IconEye, IconEyeOff } from 'twenty-ui/display';
import { Checkbox, CheckboxVariant, LightIconButton } from 'twenty-ui/input';

const StyledCompactIconContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledCheckboxContainer = styled.div`
  margin-left: auto;
`;

const StyledRecordChipContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  overflow: hidden;
`;

export const RecordBoardCardHeader = () => {
  const { recordId } = useContext(RecordBoardCardContext);

  const { objectMetadataItem, recordBoardId } = useContext(RecordBoardContext);
  const { rowIndex, columnIndex } = useContext(RecordBoardCardContext);
  const { activateBoardCard } = useActiveRecordBoardCard(recordBoardId);
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordBoardId);

  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;

  const [recordBoardCardIsExpanded, setRecordBoardCardIsExpanded] =
    useAtomComponentState(recordBoardCardIsExpandedComponentState);

  const { checkIfLastUnselectAndCloseDropdown } =
    useRecordBoardSelection(recordBoardId);

  const [isRecordBoardCardSelected, setIsRecordBoardCardSelected] =
    useAtomComponentFamilyState(
      isRecordBoardCardSelectedComponentFamilyState,
      recordId,
    );

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const recordIndexOpenRecordIn = useAtomStateValue(
    recordIndexOpenRecordInState,
  );

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const triggerEvent =
    recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
      ? 'CLICK'
      : 'MOUSE_DOWN';

  return (
    <RecordCardHeaderContainer isCompact={isCompactModeActive}>
      <StyledRecordChipContainer>
        <StopPropagationContainer>
          {isDefined(recordStore) && (
            <RecordChip
              objectNameSingular={objectMetadataItem.nameSingular}
              recordStore={recordStore}
              variant={ChipVariant.Transparent}
              onClick={() => {
                activateBoardCard({ rowIndex, columnIndex });
                unfocusBoardCard();
                openRecordFromIndexView({ recordId });
              }}
              triggerEvent={triggerEvent}
            />
          )}
        </StopPropagationContainer>
      </StyledRecordChipContainer>

      {isCompactModeActive && (
        <StyledCompactIconContainer className="compact-icon-container">
          <StopPropagationContainer>
            <LightIconButton
              Icon={recordBoardCardIsExpanded ? IconEyeOff : IconEye}
              accent="tertiary"
              onClick={() => {
                setRecordBoardCardIsExpanded(!recordBoardCardIsExpanded);
              }}
            />
          </StopPropagationContainer>
        </StyledCompactIconContainer>
      )}
      <StyledCheckboxContainer className="checkbox-container">
        <StopPropagationContainer>
          <Checkbox
            hoverable
            checked={isRecordBoardCardSelected}
            onChange={(value) => {
              setIsRecordBoardCardSelected(value.target.checked);
              checkIfLastUnselectAndCloseDropdown();
            }}
            variant={CheckboxVariant.Secondary}
          />
        </StopPropagationContainer>
      </StyledCheckboxContainer>
    </RecordCardHeaderContainer>
  );
};
