import { RecordChip } from '@/object-record/components/RecordChip';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCardHeaderContainer } from '@/object-record/record-card/components/RecordCardHeaderContainer';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';

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
`;

type RecordCalendarCardHeaderProps = {
  recordId: string;
};

export const RecordCalendarCardHeader = ({
  recordId,
}: RecordCalendarCardHeaderProps) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const record = useRecoilValue(recordStoreFamilyState(recordId));

  const { recordIndexId } = useRecordIndexIdFromCurrentContextStore();

  const [isCompactModeActive] = useRecoilComponentState(
    isRecordBoardCompactModeActiveComponentState,
    recordIndexId,
  );

  if (!isDefined(record)) {
    return null;
  }

  return (
    <RecordCardHeaderContainer isCompact={isCompactModeActive}>
      <StyledRecordChipContainer>
        <StopPropagationContainer>
          <RecordChip
            objectNameSingular={objectMetadataItem.nameSingular}
            record={record}
            variant={ChipVariant.Transparent}
            isIconHidden={true}
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
    </RecordCardHeaderContainer>
  );
};
