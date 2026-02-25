import { RecordChip } from '@/object-recordStore/components/RecordChip';
import { StopPropagationContainer } from '@/object-recordStore/recordStore-board/recordStore-board-card/components/StopPropagationContainer';
import { useRecordCalendarContextOrThrow } from '@/object-recordStore/recordStore-calendar/contexts/RecordCalendarContext';
import { RecordCardHeaderContainer } from '@/object-recordStore/recordStore-card/components/RecordCardHeaderContainer';
import { isDraggingRecordComponentState } from '@/object-recordStore/recordStore-drag/states/isDraggingRecordComponentState';
import { useOpenRecordFromIndexView } from '@/object-recordStore/recordStore-index/hooks/useOpenRecordFromIndexView';
import { recordStoreFamilyState } from '@/object-recordStore/recordStore-store/states/recordStoreFamilyState';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import styled from '@emotion/styled';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';
import { ChipVariant } from 'twenty-ui/components';
import { Checkbox, CheckboxVariant } from 'twenty-ui/input';
import { isRecordCalendarCardSelectedComponentFamilyState } from '@/object-recordStore/recordStore-calendar/recordStore-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';

const StyledCheckboxContainer = styled.div`
  margin-left: auto;
`;

const StyledRecordChipContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledRecordCardHeaderContainer = styled(RecordCardHeaderContainer)`
  padding: ${({ theme }) => theme.spacing(1)};
`;

type RecordCalendarCardHeaderProps = {
  recordId: string;
};

export const RecordCalendarCardHeader = ({
  recordId,
}: RecordCalendarCardHeaderProps) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;

  const isDraggingRecord = useAtomComponentStateValue(
    isDraggingRecordComponentState,
  );

  const [isRecordCalendarCardSelected, setIsRecordCalendarCardSelected] =
    useAtomComponentFamilyState(
      isRecordCalendarCardSelectedComponentFamilyState,
      recordId,
    );

  const handleChipClick = () => {
    if (isDraggingRecord) {
      return;
    }
    openRecordFromIndexView({ recordId });
  };

  if (!isDefined(recordStore)) {
    return null;
  }

  return (
    <StyledRecordCardHeaderContainer isCompact={isCompactModeActive}>
      <StyledRecordChipContainer>
        <StopPropagationContainer>
          <RecordChip
            objectNameSingular={objectMetadataItem.nameSingular}
            recordStore={recordStore}
            variant={ChipVariant.Transparent}
            isIconHidden={true}
            onClick={handleChipClick}
            triggerEvent={'CLICK'}
          />
        </StopPropagationContainer>
      </StyledRecordChipContainer>
      <StyledCheckboxContainer className="checkbox-container">
        <StopPropagationContainer>
          <Checkbox
            hoverable
            checked={isRecordCalendarCardSelected}
            onChange={(value) => {
              setIsRecordCalendarCardSelected(value.target.checked);
            }}
            variant={CheckboxVariant.Secondary}
          />
        </StopPropagationContainer>
      </StyledCheckboxContainer>
    </StyledRecordCardHeaderContainer>
  );
};
