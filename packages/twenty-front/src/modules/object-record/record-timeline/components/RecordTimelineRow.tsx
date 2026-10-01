import { RecordChip } from '@/object-record/components/RecordChip';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { RECORD_TIMELINE_FIRST_DAY_GRID_COLUMN } from '@/object-record/record-timeline/constants/RecordTimelineFirstDayGridColumn';
import { type RecordTimelineBarPosition } from '@/object-record/record-timeline/utils/getRecordTimelineBarPosition';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRow = styled.div<{ gridTemplateColumns: string }>`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
  min-height: ${themeCssVariables.spacing[8]};
`;

const StyledNameCell = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  left: 0;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  position: sticky;
  z-index: 1;
`;

const StyledBar = styled.button<{
  gridColumn: string;
  startsBeforeWindow: boolean;
  endsAfterWindow: boolean;
}>`
  align-self: center;
  background: ${themeCssVariables.accent.accent4};
  border: 1px solid ${themeCssVariables.accent.accent7};
  border-bottom-left-radius: ${({ startsBeforeWindow }) =>
    startsBeforeWindow ? '0' : themeCssVariables.border.radius.sm};
  border-bottom-right-radius: ${({ endsAfterWindow }) =>
    endsAfterWindow ? '0' : themeCssVariables.border.radius.sm};
  border-top-left-radius: ${({ startsBeforeWindow }) =>
    startsBeforeWindow ? '0' : themeCssVariables.border.radius.sm};
  border-top-right-radius: ${({ endsAfterWindow }) =>
    endsAfterWindow ? '0' : themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  grid-column: ${({ gridColumn }) => gridColumn};
  grid-row: 1;
  height: ${themeCssVariables.spacing[5]};
  min-width: 0;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background: ${themeCssVariables.accent.accent5};
  }
`;

type RecordTimelineRowProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  barPosition: RecordTimelineBarPosition;
  gridTemplateColumns: string;
};

export const RecordTimelineRow = ({
  objectNameSingular,
  record,
  barPosition,
  gridTemplateColumns,
}: RecordTimelineRowProps) => {
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();
  const { recordChipData } = useRecordChipData({ objectNameSingular, record });

  const openRecord = () => openRecordFromIndexView({ recordId: record.id });

  const firstDayColumn =
    barPosition.startDayIndex + RECORD_TIMELINE_FIRST_DAY_GRID_COLUMN;

  return (
    <StyledRow gridTemplateColumns={gridTemplateColumns}>
      <StyledNameCell>
        <RecordChip
          objectNameSingular={objectNameSingular}
          record={record}
          variant="ghost"
          onClick={openRecord}
          triggerEvent="CLICK"
        />
      </StyledNameCell>
      <StyledBar
        type="button"
        gridColumn={`${firstDayColumn} / span ${barPosition.daySpan}`}
        startsBeforeWindow={barPosition.startsBeforeWindow}
        endsAfterWindow={barPosition.endsAfterWindow}
        title={recordChipData.name}
        onClick={openRecord}
      >
        {recordChipData.name}
      </StyledBar>
    </StyledRow>
  );
};
