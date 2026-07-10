import { RecordChip } from '@/object-record/components/RecordChip';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { useIsRecordCalendarCardDragDisabled } from '@/object-record/record-calendar/record-calendar-card/hooks/useIsRecordCalendarCardDragDisabled';
import { getRecordCalendarCardDraggableId } from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardDraggableId';
import { RECORD_CALENDAR_WEEK_DIMENSIONS } from '@/object-record/record-calendar/week/constants/RecordCalendarWeekDimensions';
import { type RecordCalendarWeekDndData } from '@/object-record/record-calendar/week/types/RecordCalendarWeekDndData';
import { formatRecordCalendarWeekEventTimeRange } from '@/object-record/record-calendar/week/utils/formatRecordCalendarWeekEventTimeRange';
import { getRecordCalendarWeekTimedEventHeight } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekTimedEventMetrics';
import { RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardClickOutsideId';
import { isRecordCalendarCardSelectedComponentFamilyState } from '@/object-record/record-calendar/record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useDraggable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { ChipVariant } from 'twenty-ui/data-display';
import { Checkbox, CheckboxVariant } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type Temporal } from 'temporal-polyfill';
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

const StyledEventHeader = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  min-width: 0;
  width: 100%;
`;

const StyledRecordChipContainer = styled.div<{ isToday: boolean }>`
  align-items: center;
  display: flex;
  flex: 1;
  height: 20px;
  min-width: 0;
  overflow: hidden;

  [data-testid='chip'],
  [data-testid='chip'] > * {
    color: ${({ isToday }) =>
      isToday
        ? themeCssVariables.font.color.primary
        : themeCssVariables.font.color.extraLight};
  }
`;

const StyledCheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  margin-left: auto;
`;

const StyledEventTimeRow = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const StyledEventTime = styled.span<{ isToday: boolean }>`
  color: ${({ isToday }) =>
    isToday
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.extraLight};
  font-size: ${themeCssVariables.font.size.xxs};
  line-height: 12px;
  white-space: nowrap;
`;

type RecordCalendarWeekEventProps = {
  calendarDay: Temporal.PlainDate;
  calendarEndFieldName?: string;
  calendarFieldName: string;
  calendarFieldType: FieldMetadataType;
  columnCount?: number;
  columnIndex?: number;
  endInPixels?: number;
  isAllDay: boolean;
  isToday: boolean;
  recordId: string;
  startInPixels?: number;
  timeFormat: string;
  timeZone: string;
};

export const RecordCalendarWeekEvent = ({
  calendarDay,
  calendarEndFieldName,
  calendarFieldName,
  calendarFieldType,
  columnCount = 1,
  columnIndex = 0,
  endInPixels = 0,
  isAllDay,
  isToday,
  recordId,
  startInPixels = 0,
  timeFormat,
  timeZone,
}: RecordCalendarWeekEventProps) => {
  const { objectNameSingular } = useRecordCalendarContextOrThrow();
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();
  const dragIsDisabled = useIsRecordCalendarCardDragDisabled(recordId);
  const draggableId = getRecordCalendarCardDraggableId({
    calendarDay: calendarDay.toString(),
    recordId,
  });
  const { isDragSource, ref: draggableRef } =
    useDraggable<RecordCalendarWeekDndData>({
      id: draggableId,
      data: {
        kind: 'record-calendar-week-event',
        recordId,
      },
      disabled: isAllDay || dragIsDisabled,
      feedback: 'clone',
    });
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);
  const recordDate = recordStore?.[calendarFieldName];
  const recordEndDate = isDefined(calendarEndFieldName)
    ? recordStore?.[calendarEndFieldName]
    : undefined;

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
    ? formatRecordCalendarWeekEventTimeRange({
        startDateTime: recordDate,
        endDateTime: recordEndDate,
        timeFormat,
        timeZone,
      })
    : null;
  const heightInPixels = getRecordCalendarWeekTimedEventHeight({
    endInPixels,
    startInPixels,
  });

  return (
    <StyledEventPositioner
      ref={draggableRef}
      columnCount={columnCount}
      columnIndex={columnIndex}
      heightInPixels={heightInPixels}
      isAllDay={isAllDay}
      topInPixels={startInPixels}
      data-selectable-id={recordId}
    >
      <RecordCard
        data-click-outside-id={RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID}
        data-selected={isRecordCalendarCardSelected}
        onClick={() => {
          if (!isDragSource) {
            openRecordFromIndexView({ recordId });
          }
        }}
      >
        <StyledEventContent isAllDay={isAllDay}>
          <StyledEventHeader>
            <StyledRecordChipContainer isToday={isToday}>
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
            <StyledCheckboxContainer className="checkbox-container">
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
          </StyledEventHeader>
          {!isAllDay && isDefined(eventTime) && (
            <StyledEventTimeRow>
              <StyledEventTime isToday={isToday}>{eventTime}</StyledEventTime>
            </StyledEventTimeRow>
          )}
        </StyledEventContent>
      </RecordCard>
    </StyledEventPositioner>
  );
};
