import { RecordChip } from '@/object-record/components/RecordChip';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardClickOutsideId';
import { useIsRecordCalendarCardDragDisabled } from '@/object-record/record-calendar/record-calendar-card/hooks/useIsRecordCalendarCardDragDisabled';
import { getRecordCalendarCardDraggableId } from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardDraggableId';
import { RECORD_CALENDAR_WEEK_DIMENSIONS } from '@/object-record/record-calendar/week/constants/RecordCalendarWeekDimensions';
import { type RecordCalendarWeekDndData } from '@/object-record/record-calendar/week/types/RecordCalendarWeekDndData';
import { formatRecordCalendarWeekEventTimes } from '@/object-record/record-calendar/week/utils/formatRecordCalendarWeekEventTimes';
import { getRecordCalendarWeekEventHorizontalPosition } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekEventHorizontalPosition';
import { getRecordCalendarWeekTimedEventHeight } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekTimedEventMetrics';
import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { viewableRecordIdState } from '@/object-record/record-side-panel/states/viewableRecordIdState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useDraggable } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { ChipVariant } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const RECORD_CALENDAR_WEEK_EVENT_TIME_ROW_HEIGHT = 14;
const RECORD_CALENDAR_WEEK_EVENT_EXPANDED_MIN_HEIGHT =
  RECORD_CALENDAR_WEEK_DIMENSIONS.minimumEventSlotHeight +
  RECORD_CALENDAR_WEEK_EVENT_TIME_ROW_HEIGHT;

const StyledDateTimeEventCard = styled(RecordCard)`
  --record-card-background-color: ${themeCssVariables.background.tertiary};
`;

const StyledEventPositioner = styled.div<{
  columnCount: number;
  columnIndex: number;
  heightInPixels: number;
  isAllDay: boolean;
  isFocused: boolean;
  topInPixels: number;
}>`
  box-sizing: border-box;
  height: ${({ heightInPixels, isAllDay }) =>
    isAllDay ? '22px' : `${heightInPixels}px`};
  left: ${({ columnCount, columnIndex, isAllDay }) =>
    isAllDay
      ? 'auto'
      : getRecordCalendarWeekEventHorizontalPosition({
          columnCount,
          columnIndex,
        }).left};
  min-width: 0;
  overflow: hidden;
  position: ${({ isAllDay }) => (isAllDay ? 'relative' : 'absolute')};
  right: auto;
  top: ${({ isAllDay, topInPixels }) =>
    isAllDay
      ? 'auto'
      : `${topInPixels + RECORD_CALENDAR_WEEK_DIMENSIONS.eventVerticalGap / 2}px`};
  width: ${({ columnCount, columnIndex, isAllDay }) =>
    isAllDay
      ? '100%'
      : getRecordCalendarWeekEventHorizontalPosition({
          columnCount,
          columnIndex,
        }).width};
  z-index: ${({ columnCount, columnIndex, isAllDay, isFocused }) => {
    if (isAllDay) {
      return 1;
    }

    const { focusedStackingOrder, stackingOrder } =
      getRecordCalendarWeekEventHorizontalPosition({
        columnCount,
        columnIndex,
      });

    return isFocused ? focusedStackingOrder : stackingOrder;
  }};

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

const StyledEventLabel = styled.div<{ isDateOnly: boolean }>`
  align-items: center;
  display: flex;
  flex: 1;
  font-size: ${({ isDateOnly }) =>
    isDateOnly ? themeCssVariables.font.size.xs : '12px'};
  font-weight: ${({ isDateOnly }) =>
    isDateOnly ? 'inherit' : themeCssVariables.font.weight.medium};
  height: 20px;
  line-height: ${({ isDateOnly }) => (isDateOnly ? 'normal' : '1.4')};
  min-width: 0;
  overflow: hidden;
`;

const StyledRecordChipContainer = styled.div`
  display: flex;
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;

  [data-testid='chip'],
  [data-testid='chip'] > * {
    color: ${themeCssVariables.font.color.primary};
  }

  [data-testid='chip'] {
    min-width: 0;
    padding-right: 0;
  }
`;

const StyledCompactEventStartTime = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
  font-size: 9px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: normal;
  white-space: nowrap;
`;

const StyledEventTimeRow = styled.div`
  align-items: center;
  display: flex;
  height: ${RECORD_CALENDAR_WEEK_EVENT_TIME_ROW_HEIGHT}px;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const StyledEventTime = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: 9px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: normal;
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

  const viewableRecordId = useAtomStateValue(viewableRecordIdState);
  const isFocused = viewableRecordId === recordId;

  const isDateOnly = calendarFieldType === FieldMetadataType.DATE;

  if (
    !isDefined(recordStore) ||
    typeof recordDate !== 'string' ||
    isAllDay !== isDateOnly
  ) {
    return null;
  }

  const eventTimes = !isDateOnly
    ? formatRecordCalendarWeekEventTimes({
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
  const isCompactTimedEvent =
    !isAllDay &&
    heightInPixels < RECORD_CALENDAR_WEEK_EVENT_EXPANDED_MIN_HEIGHT;
  const expandedEventTime = eventTimes?.timeRange;
  const EventCard = isDateOnly ? RecordCard : StyledDateTimeEventCard;

  return (
    <StyledEventPositioner
      ref={draggableRef}
      columnCount={columnCount}
      columnIndex={columnIndex}
      heightInPixels={heightInPixels}
      isAllDay={isAllDay}
      isFocused={isFocused}
      topInPixels={startInPixels}
      data-selectable-id={recordId}
    >
      <EventCard
        data-click-outside-id={RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID}
        data-focused={isFocused}
        onClick={() => {
          if (!isDragSource) {
            openRecordFromIndexView({ recordId });
          }
        }}
      >
        <StyledEventContent isAllDay={isAllDay}>
          <StyledEventHeader>
            <StyledEventLabel isDateOnly={isDateOnly}>
              <StyledRecordChipContainer>
                <RecordChip
                  objectNameSingular={objectNameSingular}
                  record={recordStore}
                  variant={ChipVariant.Transparent}
                  isIconHidden
                  forceDisableClick
                  triggerEvent="CLICK"
                />
              </StyledRecordChipContainer>
              {isCompactTimedEvent && isDefined(eventTimes) && (
                <StyledCompactEventStartTime>
                  {`, ${eventTimes.startTime}`}
                </StyledCompactEventStartTime>
              )}
            </StyledEventLabel>
          </StyledEventHeader>
          {!isAllDay &&
            !isCompactTimedEvent &&
            isDefined(expandedEventTime) && (
              <StyledEventTimeRow>
                <StyledEventTime>{expandedEventTime}</StyledEventTime>
              </StyledEventTimeRow>
            )}
        </StyledEventContent>
      </EventCard>
    </StyledEventPositioner>
  );
};
