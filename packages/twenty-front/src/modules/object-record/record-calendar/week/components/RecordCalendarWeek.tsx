import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { RecordCalendarAddNew } from '@/object-record/record-calendar/components/RecordCalendarAddNew';
import { RECORD_CALENDAR_WEEK_VISIBLE_RECORD_LIMIT } from '@/object-record/record-calendar/constants/RecordCalendarWeekVisibleRecordLimit';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { RecordCalendarWeekEvent } from '@/object-record/record-calendar/week/components/RecordCalendarWeekEvent';
import { RecordCalendarWeekDragDropContext } from '@/object-record/record-calendar/week/components/RecordCalendarWeekDragDropContext';
import { RECORD_CALENDAR_WEEK_DIMENSIONS } from '@/object-record/record-calendar/week/constants/RecordCalendarWeekDimensions';
import { useRecordCalendarWeekDaysRange } from '@/object-record/record-calendar/week/hooks/useRecordCalendarWeekDaysRange';
import { computeRecordCalendarWeekEventLayouts } from '@/object-record/record-calendar/week/utils/computeRecordCalendarWeekEventLayouts';
import { getRecordCalendarWeekTimedEventMetrics } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekTimedEventMetrics';
import { getRecordCalendarWeekSlotIndex } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekSlotIndex';
import { recordIndexCalendarEndFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarEndFieldMetadataIdState';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { TimeZoneAbbreviation } from '@/ui/input/components/internal/date/components/TimeZoneAbbreviation';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useStore } from 'jotai';
import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Temporal } from 'temporal-polyfill';
import {
  isDefined,
  isPlainDateInWeekend,
  isSamePlainDate,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const CURRENT_TIME_REFRESH_INTERVAL_IN_MILLISECONDS = 60_000;
const DEFAULT_KEYBOARD_SLOT_INDEX = 18;

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  min-width: 1000px;
  overflow: clip;
`;

const StyledHeader = styled.div`
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  grid-template-columns:
    ${RECORD_CALENDAR_WEEK_DIMENSIONS.timeGutterWidth}px
    repeat(7, minmax(120px, 1fr));
  position: sticky;
  top: 0;
  z-index: 3;
`;

const StyledHeaderGutter = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  height: 32px;
  justify-content: flex-end;
  padding-right: ${themeCssVariables.spacing[1]};
`;

const StyledDayHeader = styled.div`
  align-items: center;
  border-left: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  height: 32px;
  justify-content: center;
`;

const StyledDayNumber = styled.span<{ isToday: boolean }>`
  align-items: center;
  background: ${({ isToday }) =>
    isToday ? themeCssVariables.color.blue : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isToday }) =>
    isToday
      ? themeCssVariables.font.color.inverted
      : themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ isToday }) =>
    isToday
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const StyledAllDayLabel = styled(StyledHeaderGutter)`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  height: 28px;
`;

const StyledAllDayCell = styled.div`
  align-items: center;
  border-left: 1px solid ${themeCssVariables.border.color.light};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing['0.5']};
  height: 28px;
  min-width: 0;
  overflow: hidden;
  padding: ${themeCssVariables.spacing['0.5']};
`;

const StyledAdditionalEventCount = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  white-space: nowrap;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns:
    ${RECORD_CALENDAR_WEEK_DIMENSIONS.timeGutterWidth}px
    repeat(7, minmax(120px, 1fr));
  height: ${RECORD_CALENDAR_WEEK_DIMENSIONS.gridHeight}px;
  position: relative;
`;

const StyledTimeGutter = styled.div`
  height: ${RECORD_CALENDAR_WEEK_DIMENSIONS.gridHeight}px;
  position: relative;
`;

const StyledHourLabel = styled.span<{ topInPixels: number }>`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  position: absolute;
  right: ${themeCssVariables.spacing[1]};
  top: ${({ topInPixels }) => `${topInPixels}px`};
  transform: translateY(-50%);
  white-space: nowrap;
`;

const StyledDayColumn = styled.div<{ isWeekend: boolean }>`
  background-color: ${({ isWeekend }) =>
    isWeekend
      ? themeCssVariables.background.secondary
      : themeCssVariables.background.primary};
  background-image: repeating-linear-gradient(
    to bottom,
    ${themeCssVariables.border.color.light} 0,
    ${themeCssVariables.border.color.light} 1px,
    transparent 1px,
    transparent ${RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight}px
  );
  border-left: 1px solid ${themeCssVariables.border.color.light};
  height: ${RECORD_CALENDAR_WEEK_DIMENSIONS.gridHeight}px;
  overflow: hidden;
  position: relative;
`;

const StyledSlotAddNewPositioner = styled.div<{ topInPixels: number }>`
  align-items: center;
  display: flex;
  height: ${RECORD_CALENDAR_WEEK_DIMENSIONS.slotHeight}px;
  left: ${themeCssVariables.spacing['0.5']};
  pointer-events: none;
  position: absolute;
  right: 0;
  top: ${({ topInPixels }) => `${topInPixels}px`};
  z-index: 0;

  > div {
    pointer-events: auto;
  }
`;

const StyledCurrentTimeLine = styled.div<{ topInPixels: number }>`
  background: ${themeCssVariables.color.red8};
  height: 1px;
  left: ${RECORD_CALENDAR_WEEK_DIMENSIONS.timeGutterWidth}px;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: ${({ topInPixels }) => `${topInPixels}px`};
  z-index: 2;

  &::after {
    background: ${themeCssVariables.color.red8};
    border-radius: 50%;
    content: '';
    height: 5px;
    left: -2px;
    position: absolute;
    top: -2px;
    width: 5px;
  }
`;

const StyledCurrentTimeLabel = styled.span<{ topInPixels: number }>`
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.color.red9};
  font-size: ${themeCssVariables.font.size.xs};
  padding-right: ${themeCssVariables.spacing['0.5']};
  position: absolute;
  right: calc(100% - ${RECORD_CALENDAR_WEEK_DIMENSIONS.timeGutterWidth - 1}px);
  top: ${({ topInPixels }) => `${topInPixels}px`};
  transform: translateY(-50%);
  white-space: nowrap;
  z-index: 3;
`;

const StyledScrollAnchor = styled.div<{ topInPixels: number }>`
  height: 1px;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: ${({ topInPixels }) => `${topInPixels}px`};
  width: 1px;
`;

type WeekDayCellProps = {
  calendarEndFieldName?: string;
  calendarFieldName: string;
  calendarFieldType: FieldMetadataType;
  day: Temporal.PlainDate;
  isToday: boolean;
  timeFormat: string;
  timeZone: string;
};

type RecordCalendarWeekAllDayCellProps = WeekDayCellProps;
type RecordCalendarWeekDayColumnProps = WeekDayCellProps;

const RecordCalendarWeekAllDayCell = ({
  calendarFieldName,
  calendarFieldType,
  day,
  isToday,
  timeFormat,
  timeZone,
}: RecordCalendarWeekAllDayCellProps) => {
  const recordIds = useAtomComponentFamilySelectorValue(
    calendarDayRecordIdsComponentFamilySelector,
    { day, timeZone },
  );

  const allDayRecordIds =
    calendarFieldType === FieldMetadataType.DATE ? recordIds : [];

  return (
    <StyledAllDayCell>
      {allDayRecordIds.slice(0, 1).map((recordId) => (
        <RecordCalendarWeekEvent
          key={recordId}
          calendarDay={day}
          calendarFieldName={calendarFieldName}
          calendarFieldType={calendarFieldType}
          isAllDay
          isToday={isToday}
          recordId={recordId}
          timeFormat={timeFormat}
          timeZone={timeZone}
        />
      ))}
      {allDayRecordIds.length > 1 && (
        <StyledAdditionalEventCount>
          +{allDayRecordIds.length - 1}
        </StyledAdditionalEventCount>
      )}
    </StyledAllDayCell>
  );
};

const RecordCalendarWeekDayColumn = ({
  calendarEndFieldName,
  calendarFieldName,
  calendarFieldType,
  day,
  isToday,
  timeFormat,
  timeZone,
}: RecordCalendarWeekDayColumnProps) => {
  const store = useStore();
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);
  const recordIds = useAtomComponentFamilySelectorValue(
    calendarDayRecordIdsComponentFamilySelector,
    { day, timeZone },
  );

  const eventLayoutInputs =
    calendarFieldType === FieldMetadataType.DATE
      ? []
      : recordIds
          .map((recordId) => {
            const record = store.get(
              recordStoreFamilyState.atomFamily(recordId),
            );
            const recordDate = record?.[calendarFieldName];
            const recordEndDate = isDefined(calendarEndFieldName)
              ? record?.[calendarEndFieldName]
              : undefined;
            const metrics = getRecordCalendarWeekTimedEventMetrics({
              day,
              startDateTime: recordDate,
              endDateTime: recordEndDate,
              timeZone,
            });

            if (metrics === null) {
              return null;
            }

            return {
              ...metrics,
              recordId,
            };
          })
          .filter(isDefined)
          .sort(
            (eventA, eventB) =>
              eventA.startInPixels - eventB.startInPixels ||
              eventA.endInPixels - eventB.endInPixels ||
              eventA.recordId.localeCompare(eventB.recordId),
          );

  const eventLayouts = computeRecordCalendarWeekEventLayouts(
    eventLayoutInputs.slice(0, RECORD_CALENDAR_WEEK_VISIBLE_RECORD_LIMIT),
  );

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (
      event.target instanceof Element &&
      event.target.closest('[data-selectable-id]') !== null
    ) {
      setHoveredSlotIndex(null);
      return;
    }

    const columnRect = event.currentTarget.getBoundingClientRect();

    setHoveredSlotIndex(
      getRecordCalendarWeekSlotIndex({
        columnHeight: columnRect.height,
        columnTop: columnRect.top,
        pointerY: event.clientY,
      }),
    );
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setHoveredSlotIndex(
        (currentSlotIndex) => currentSlotIndex ?? DEFAULT_KEYBOARD_SLOT_INDEX,
      );
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHoveredSlotIndex(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    const slotCount =
      (RECORD_CALENDAR_WEEK_DIMENSIONS.hoursInDay * 60) /
      RECORD_CALENDAR_WEEK_DIMENSIONS.snapIntervalInMinutes;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();

      const slotDelta = event.key === 'ArrowDown' ? 1 : -1;

      setHoveredSlotIndex((currentSlotIndex) =>
        Math.min(
          slotCount - 1,
          Math.max(
            0,
            (currentSlotIndex ?? DEFAULT_KEYBOARD_SLOT_INDEX) + slotDelta,
          ),
        ),
      );
    }
  };

  return (
    <StyledDayColumn
      aria-label={day.toLocaleString(undefined, { dateStyle: 'full' })}
      isWeekend={isPlainDateInWeekend(day)}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onMouseLeave={(event) => {
        if (!event.currentTarget.contains(document.activeElement)) {
          setHoveredSlotIndex(null);
        }
      }}
      onMouseMove={handleMouseMove}
      tabIndex={0}
    >
      {isDefined(hoveredSlotIndex) && (
        <StyledSlotAddNewPositioner
          data-testid="record-calendar-week-slot-add"
          topInPixels={
            hoveredSlotIndex * RECORD_CALENDAR_WEEK_DIMENSIONS.slotHeight
          }
        >
          <RecordCalendarAddNew
            cardDate={day}
            cardTime={Temporal.PlainTime.from('00:00').add({
              minutes:
                hoveredSlotIndex *
                RECORD_CALENDAR_WEEK_DIMENSIONS.snapIntervalInMinutes,
            })}
            compact
          />
        </StyledSlotAddNewPositioner>
      )}
      {eventLayouts.map(
        ({
          columnCount,
          columnIndex,
          endInPixels,
          recordId,
          startInPixels,
        }) => (
          <RecordCalendarWeekEvent
            key={recordId}
            calendarDay={day}
            calendarEndFieldName={calendarEndFieldName}
            calendarFieldName={calendarFieldName}
            calendarFieldType={calendarFieldType}
            columnCount={columnCount}
            columnIndex={columnIndex}
            endInPixels={endInPixels}
            isAllDay={false}
            isToday={isToday}
            recordId={recordId}
            startInPixels={startInPixels}
            timeFormat={timeFormat}
            timeZone={timeZone}
          />
        ),
      )}
    </StyledDayColumn>
  );
};

export const RecordCalendarWeek = () => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const { timeFormat, timeZone } = useDateTimeFormat();
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );
  const recordCalendarSelectedDate = useAtomComponentStateValue(
    recordCalendarSelectedDateComponentState,
    recordCalendarId,
  );
  const recordIndexCalendarFieldMetadataId = useAtomStateValue(
    recordIndexCalendarFieldMetadataIdState,
  );
  const recordIndexCalendarEndFieldMetadataId = useAtomStateValue(
    recordIndexCalendarEndFieldMetadataIdState,
  );
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [currentInstant, setCurrentInstant] = useState(() =>
    Temporal.Now.instant(),
  );

  const { firstDayOfWeek, lastDayOfWeek, weekDays } =
    useRecordCalendarWeekDaysRange(recordCalendarSelectedDate);

  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarFieldMetadataId,
  );
  const calendarEndFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarEndFieldMetadataId,
  );

  const now = currentInstant.toZonedDateTimeISO(timeZone);
  const today = now.toPlainDate();
  const isCurrentWeek =
    Temporal.PlainDate.compare(today, firstDayOfWeek) >= 0 &&
    Temporal.PlainDate.compare(today, lastDayOfWeek) <= 0;
  const currentTimeTopInPixels =
    (now.hour + now.minute / 60) * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight;
  const initialScrollHour = isCurrentWeek ? Math.max(now.hour - 2, 0) : 8;
  const firstDayOfWeekString = firstDayOfWeek.toString();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentInstant(Temporal.Now.instant());
    }, CURRENT_TIME_REFRESH_INTERVAL_IN_MILLISECONDS);

    return () => window.clearInterval(intervalId);
  }, []);

  const isAllDayView =
    calendarFieldMetadataItem?.type === FieldMetadataType.DATE;
  const isTimedView =
    calendarFieldMetadataItem?.type === FieldMetadataType.DATE_TIME;
  const compatibleCalendarEndFieldName =
    isTimedView &&
    calendarEndFieldMetadataItem?.type === FieldMetadataType.DATE_TIME
      ? calendarEndFieldMetadataItem.name
      : undefined;

  useEffect(() => {
    if (!isTimedView) {
      return;
    }

    scrollAnchorRef.current?.scrollIntoView({
      block: 'center',
      inline: 'nearest',
    });
  }, [firstDayOfWeekString, isTimedView]);

  if (
    !isDefined(calendarFieldMetadataItem) ||
    (!isAllDayView && !isTimedView)
  ) {
    return null;
  }

  return (
    <RecordCalendarWeekDragDropContext
      gridRef={gridRef}
      weekDays={weekDays.map(({ date }) => date)}
    >
      <StyledContainer>
        <StyledHeader>
          <StyledHeaderGutter>
            {isTimedView && <TimeZoneAbbreviation instant={currentInstant} />}
          </StyledHeaderGutter>
          {weekDays.map(({ date, label }) => {
            const isToday = isSamePlainDate(date, today);

            return (
              <StyledDayHeader key={date.toString()}>
                <span>{label}</span>
                <StyledDayNumber isToday={isToday}>{date.day}</StyledDayNumber>
              </StyledDayHeader>
            );
          })}
          {isAllDayView && (
            <>
              <StyledAllDayLabel>{t`All day`}</StyledAllDayLabel>
              {weekDays.map(({ date }) => (
                <RecordCalendarWeekAllDayCell
                  key={`all-day-${date.toString()}`}
                  calendarFieldName={calendarFieldMetadataItem.name}
                  calendarFieldType={calendarFieldMetadataItem.type}
                  day={date}
                  isToday={isSamePlainDate(date, today)}
                  timeFormat={timeFormat}
                  timeZone={timeZone}
                />
              ))}
            </>
          )}
        </StyledHeader>
        {isTimedView && (
          <StyledGrid ref={gridRef}>
            <StyledTimeGutter>
              {Array.from(
                { length: RECORD_CALENDAR_WEEK_DIMENSIONS.hoursInDay },
                (_, hour) => (
                  <StyledHourLabel
                    key={hour}
                    topInPixels={
                      hour * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight
                    }
                  >
                    {format(new Date(2000, 0, 1, hour), timeFormat)}
                  </StyledHourLabel>
                ),
              )}
              <StyledScrollAnchor
                ref={scrollAnchorRef}
                topInPixels={
                  initialScrollHour * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight
                }
              />
            </StyledTimeGutter>
            {weekDays.map(({ date }) => (
              <RecordCalendarWeekDayColumn
                key={date.toString()}
                calendarEndFieldName={compatibleCalendarEndFieldName}
                calendarFieldName={calendarFieldMetadataItem.name}
                calendarFieldType={calendarFieldMetadataItem.type}
                day={date}
                isToday={isSamePlainDate(date, today)}
                timeFormat={timeFormat}
                timeZone={timeZone}
              />
            ))}
            {isCurrentWeek && (
              <>
                <StyledCurrentTimeLine topInPixels={currentTimeTopInPixels} />
                <StyledCurrentTimeLabel topInPixels={currentTimeTopInPixels}>
                  {formatInTimeZone(
                    new Date(currentInstant.toString()),
                    timeZone,
                    timeFormat,
                  )}
                </StyledCurrentTimeLabel>
              </>
            )}
          </StyledGrid>
        )}
      </StyledContainer>
    </RecordCalendarWeekDragDropContext>
  );
};
