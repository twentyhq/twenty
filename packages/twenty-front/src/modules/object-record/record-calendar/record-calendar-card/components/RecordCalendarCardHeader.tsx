import { RecordChip } from '@/object-record/components/RecordChip';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCardHeaderContainer } from '@/object-record/record-card/components/RecordCardHeaderContainer';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ChipVariant } from 'twenty-ui/components';
import { Checkbox, CheckboxVariant } from 'twenty-ui/input';
import { isRecordCalendarCardSelectedComponentFamilyState } from '@/object-record/record-calendar/record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';

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
  const record = useRecoilValue(recordStoreFamilyState(recordId));
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;

  const isDraggingRecord = useRecoilComponentValue(
    isDraggingRecordComponentState,
  );

  const [isCurrentCardSelected, setIsCurrentCardSelected] =
    useRecoilComponentFamilyState(
      isRecordCalendarCardSelectedComponentFamilyState,
      recordId,
    );

  const handleChipClick = () => {
    if (isDraggingRecord) {
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
            checked={isCurrentCardSelected}
            onChange={(value) => {
              setIsCurrentCardSelected(value.target.checked);
            }}
            variant={CheckboxVariant.Secondary}
          />
        </StopPropagationContainer>
      </StyledCheckboxContainer>
    </StyledRecordCardHeaderContainer>
  );
};
