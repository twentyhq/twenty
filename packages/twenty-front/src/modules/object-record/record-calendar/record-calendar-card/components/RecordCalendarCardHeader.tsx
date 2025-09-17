import { RecordChip } from '@/object-record/components/RecordChip';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCardHeaderContainer } from '@/object-record/record-card/components/RecordCardHeaderContainer';
import { useRecordDragState } from '@/object-record/record-drag/shared/hooks/useRecordDragState';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ChipVariant } from 'twenty-ui/components';
import { Checkbox, CheckboxVariant } from 'twenty-ui/input';

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
  const { objectMetadataItem, viewBarInstanceId } =
    useRecordCalendarContextOrThrow();
  const record = useRecoilValue(recordStoreFamilyState(recordId));
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;

  const dragState = useRecordDragState('calendar', viewBarInstanceId);

  const handleChipClick = () => {
    if (dragState.isDragging) {
      return;
    }
    openRecordFromIndexView({ recordId });
  };

  if (!isDefined(record)) {
    return null;
  }

  return (
    <StyledRecordCardHeaderContainer isCompact={isCompactModeActive}>
      <StyledRecordChipContainer>
        <StopPropagationContainer>
          <RecordChip
            objectNameSingular={objectMetadataItem.nameSingular}
            record={record}
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
            checked={false}
            onChange={() => {}}
            variant={CheckboxVariant.Secondary}
          />
        </StopPropagationContainer>
      </StyledCheckboxContainer>
    </StyledRecordCardHeaderContainer>
  );
};
