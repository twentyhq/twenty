import { RecordChip } from '@/object-record/components/RecordChip';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RECORD_CALENDAR_WEEK_DIMENSIONS } from '@/object-record/record-calendar/week/constants/RecordCalendarWeekDimensions';
import { RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardClickOutsideId';
import { isRecordCalendarCardSelectedComponentFamilyState } from '@/object-record/record-calendar/record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { formatInTimeZone } from 'date-fns-tz';
import { isDefined } from 'twenty-shared/utils';
import { ChipVariant } from 'twenty-ui/data-display';
import { Checkbox, CheckboxVariant } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const RECORD_CALENDAR_WEEK_EVENT_HORIZONTAL_INSET = 4;
const RECORD_CALENDAR_WEEK_EVENT_COLUMN_GAP = 2;

const getTimedEventLeft = (columnIndex: number, columnCount: number) => {
  const leftPercentage = (columnIndex * 100) / columnCount;
  const pixelOffset =
    RECORD_CALENDAR_WEEK_EVENT_HORIZONTAL_INSET -
    ((RECORD_CALENDAR_WEEK_EVENT_HORIZONTAL_INSET * 2 -
      RECORD_CALENDAR_WEEK_EVENT_COLUMN_GAP) *
      columnIndex) /
      columnCount;

  return `calc(${leftPercentage}% + ${pixelOffset}px)`;
};

const getTimedEventWidth = (columnCount: number) => {
  const widthPercentage = 100 / columnCount;
  const pixelReduction =
    RECORD_CALENDAR_WEEK_EVENT_COLUMN_GAP +
    (RECORD_CALENDAR_WEEK_EVENT_HORIZONTAL_INSET * 2 -
      RECORD_CALENDAR_WEEK_EVENT_COLUMN_GAP) /
      columnCount;

  return `calc(${widthPercentage}% - ${pixelReduction}px)`;
};

const StyledEventPositioner = styled.div<{
  columnCount: number;
  columnIndex: number;
  heightInPixels: number;
  isAllDay: boolean;
  topInPixels: number;
}>`
  box-sizing: border-box;
  height: ${({ heightInPixels, isAllDay }) =>
    isAllDay ? '22px' : `${heightInPixels}px`};
  left: ${({ columnCount, columnIndex, isAllDay }) =>
    isAllDay ? 'auto' : getTimedEventLeft(columnIndex, columnCount)};
  min-width: 0;
  overflow: hidden;
  position: ${({ isAllDay }) => (isAllDay ? 'relative' : 'absolute')};
  right: auto;
  top: ${({ isAllDay, topInPixels }) =>
    isAllDay
      ? 'auto'
      : `${topInPixels + RECORD_CALENDAR_WEEK_DIMENSIONS.eventVerticalGap / 2}px`};
  width: ${({ columnCount, isAllDay }) =>
    isAllDay ? '100%' : getTimedEventWidth(columnCount)};
  z-index: 1;

  > div {
    height: 100%;
  }
`;

const StyledEventContent = styled.div<{ isAllDay: boolean }>`
  align-items: ${({ isAllDay }) => (isAllDay ? 'center' : 'flex-start')};
  box-sizing: border-box;
  display: flex;
  flex-direction: ${({ isAllDay }) => (isAllDay ? 'row' : 'column')};
  height: 100%;
  min-width: 0;
  overflow: hidden;
  padding: ${({ isAllDay }) =>
    isAllDay
      ? `0 ${themeCssVariables.spacing['0.5']}`
      : `${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]}`};
  position: relative;
  width: 100%;
`;

const StyledRecordChipContainer = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  min-width: 0;
  overflow: hidden;
  padding-right: ${themeCssVariables.spacing[5]};
  width: 100%;
`;

const StyledCheckboxContainer = styled.div<{ isAllDay: boolean }>`
  align-items: center;
  display: flex;
  height: 20px;
  position: absolute;
  right: ${({ isAllDay }) =>
    isAllDay ? themeCssVariables.spacing['0.5'] : themeCssVariables.spacing[1]};
  top: 50%;
  transform: translateY(-50%);
`;

const StyledEventTimeRow = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const StyledEventTime = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 12px;
  white-space: nowrap;
`;

type RecordCalendarWeekEventProps = {
  calendarFieldName: string;
  calendarFieldType: FieldMetadataType;
  columnCount?: number;
  columnIndex?: number;
  endInPixels?: number;
  isAllDay: boolean;
  recordId: string;
  startInPixels?: number;
  timeFormat: string;
  timeZone: string;
};

export const RecordCalendarWeekEvent = ({
  calendarFieldName,
  calendarFieldType,
  columnCount = 1,
  columnIndex = 0,
  endInPixels = 0,
  isAllDay,
  recordId,
  startInPixels = 0,
  timeFormat,
  timeZone,
}: RecordCalendarWeekEventProps) => {
  const { objectNameSingular } = useRecordCalendarContextOrThrow();
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);
  const recordDate = recordStore?.[calendarFieldName];

  const [isRecordCalendarCardSelected, setIsRecordCalendarCardSelected] =
    useAtomComponentFamilyState(
      isRecordCalendarCardSelectedComponentFamilyState,
      recordId,
    );

  const isDateOnly = calendarFieldType === FieldMetadataType.DATE;

  if (
    !isDefined(recordStore) ||
    typeof recordDate !== 'string' ||
    isAllDay !== isDateOnly
  ) {
    return null;
  }

  const eventTime = !isDateOnly
    ? formatInTimeZone(new Date(recordDate), timeZone, timeFormat)
    : null;
  const heightInPixels = Math.max(
    0,
    endInPixels -
      startInPixels -
      RECORD_CALENDAR_WEEK_DIMENSIONS.eventVerticalGap,
  );

  return (
    <StyledEventPositioner
      columnCount={columnCount}
      columnIndex={columnIndex}
      heightInPixels={heightInPixels}
      isAllDay={isAllDay}
      topInPixels={startInPixels}
    >
      <RecordCard
        data-click-outside-id={RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID}
        data-selected={isRecordCalendarCardSelected}
        onClick={() => openRecordFromIndexView({ recordId })}
      >
        <StyledEventContent isAllDay={isAllDay}>
          <StyledRecordChipContainer>
            <RecordChip
              objectNameSingular={objectNameSingular}
              record={recordStore}
              variant={ChipVariant.Transparent}
              isBold
              isIconHidden
              maxWidth={128}
              forceDisableClick
              triggerEvent="CLICK"
            />
          </StyledRecordChipContainer>
          <StyledCheckboxContainer
            className="checkbox-container"
            isAllDay={isAllDay}
          >
            <StopPropagationContainer>
              <Checkbox
                hoverable
                checked={isRecordCalendarCardSelected}
                onChange={(event) => {
                  setIsRecordCalendarCardSelected(event.target.checked);
                }}
                variant={CheckboxVariant.Secondary}
              />
            </StopPropagationContainer>
          </StyledCheckboxContainer>
          {!isAllDay && isDefined(eventTime) && (
            <StyledEventTimeRow>
              <StyledEventTime>{eventTime}</StyledEventTime>
            </StyledEventTimeRow>
          )}
        </StyledEventContent>
      </RecordCard>
    </StyledEventPositioner>
  );
};
