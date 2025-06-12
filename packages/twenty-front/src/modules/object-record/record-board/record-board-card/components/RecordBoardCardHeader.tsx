import { RecordChip } from '@/object-record/components/RecordChip';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { RecordBoardCardHeaderContainer } from '@/object-record/record-board/record-board-card/components/RecordBoardCardHeaderContainer';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';

import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { Dispatch, SetStateAction, useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { AvatarChipVariant } from 'twenty-ui/components';
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

type RecordBoardCardHeaderProps = {
  isCardExpanded?: boolean;
  setIsCardExpanded?: Dispatch<SetStateAction<boolean>>;
};

export const RecordBoardCardHeader = ({
  isCardExpanded,
  setIsCardExpanded,
}: RecordBoardCardHeaderProps) => {
  const { recordId } = useContext(RecordBoardCardContext);

  const record = useRecoilValue(recordStoreFamilyState(recordId));

  const { objectMetadataItem } = useContext(RecordBoardContext);

  const recordBoardId = useAvailableScopeIdOrThrow(
    RecordBoardScopeInternalContext,
  );

  const showCompactView = useRecoilComponentValueV2(
    isRecordBoardCompactModeActiveComponentState,
  );

  const { checkIfLastUnselectAndCloseDropdown } =
    useRecordBoardSelection(recordBoardId);

  const [isCurrentCardSelected, setIsCurrentCardSelected] =
    useRecoilComponentFamilyStateV2(
      isRecordBoardCardSelectedComponentFamilyState,
      recordId,
    );

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  return (
    <RecordBoardCardHeaderContainer showCompactView={showCompactView}>
      <StopPropagationContainer>
        {isDefined(record) && (
          <RecordChip
            objectNameSingular={objectMetadataItem.nameSingular}
            record={record}
            variant={AvatarChipVariant.Transparent}
            maxWidth={150}
            onClick={() => {
              openRecordFromIndexView({ recordId });
            }}
            triggerEvent="CLICK"
          />
        )}
      </StopPropagationContainer>

      {showCompactView && (
        <StyledCompactIconContainer className="compact-icon-container">
          <StopPropagationContainer>
            <LightIconButton
              Icon={isCardExpanded ? IconEyeOff : IconEye}
              accent="tertiary"
              onClick={() => {
                setIsCardExpanded?.((prev) => !prev);
              }}
            />
          </StopPropagationContainer>
        </StyledCompactIconContainer>
      )}
      <StyledCheckboxContainer className="checkbox-container">
        <StopPropagationContainer>
          <Checkbox
            hoverable
            checked={isCurrentCardSelected}
            onChange={() => {
              setIsCurrentCardSelected(!isCurrentCardSelected);
              checkIfLastUnselectAndCloseDropdown();
            }}
            variant={CheckboxVariant.Secondary}
          />
        </StopPropagationContainer>
      </StyledCheckboxContainer>
    </RecordBoardCardHeaderContainer>
  );
};
