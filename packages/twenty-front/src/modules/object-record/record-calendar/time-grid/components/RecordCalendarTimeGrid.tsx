import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { RecordCalendarAddNew } from '@/object-record/record-calendar/components/RecordCalendarAddNew';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { RecordCalendarTimeGridAllDayCell } from '@/object-record/record-calendar/time-grid/components/RecordCalendarTimeGridAllDayCell';
import { RecordCalendarWeekEvent } from '@/object-record/record-calendar/week/components/RecordCalendarWeekEvent';
import { RecordCalendarWeekDragDropContext } from '@/object-record/record-calendar/week/components/RecordCalendarWeekDragDropContext';
import { RECORD_CALENDAR_WEEK_DIMENSIONS } from '@/object-record/record-calendar/week/constants/RecordCalendarWeekDimensions';
import { computeRecordCalendarWeekEventLayouts } from '@/object-record/record-calendar/week/utils/computeRecordCalendarWeekEventLayouts';
import { getRecordCalendarWeekTimedEventMetrics } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekTimedEventMetrics';
import { getRecordCalendarWeekSlotIndex } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekSlotIndex';
import {
  type RecordCalendarWeekActiveSlot,
  type RecordCalendarWeekSlotInteractionMode,
  updateRecordCalendarWeekActiveSlot,
} from '@/object-record/record-calendar/week/utils/updateRecordCalendarWeekActiveSlot';
import { recordIndexCalendarEndFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarEndFieldMetadataIdComponentState';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { TimeZoneAbbreviation } from '@/ui/input/components/internal/date/components/TimeZoneAbbreviation';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useStore } from 'jotai';
import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  memo,
  useCallback,
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

const StyledContainer = styled.div<{ minWidthInPixels: number }>`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  border-top: 0;
  min-width: ${({ minWidthInPixels }) => `${minWidthInPixels}px`};
  overflow: clip;
`;

const StyledHeader = styled.div<{ dayCount: number }>`
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  grid-template-columns:
    ${RECORD_CALENDAR_WEEK_DIMENSIONS.timeGutterWidth}px
    repeat(${({ dayCount }) => dayCount}, minmax(120px, 1fr));
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
  align-items: flex-start;
  height: auto;
  min-height: 28px;
  padding-top: ${themeCssVariables.spacing[1]};
`;

const StyledAllDayGrid = styled.div<{ dayCount: number }>`
  display: grid;
  grid-template-columns:
    ${RECORD_CALENDAR_WEEK_DIMENSIONS.timeGutterWidth}px
    repeat(${({ dayCount }) => dayCount}, minmax(120px, 1fr));
`;

const StyledGrid = styled.div<{ dayCount: number }>`
  display: grid;
  grid-template-columns:
    ${RECORD_CALENDAR_WEEK_DIMENSIONS.timeGutterWidth}px
    repeat(${({ dayCount }) => dayCount}, minmax(120px, 1fr));
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
  isolation: isolate;
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
  timeFormat: string;
  timeZone: string;
};

type RecordCalendarWeekDayColumnProps = Omit<WeekDayCellProps, 'day'> & {
  activeSlotIndex: number | null;
  dayString: string;
  onActiveSlotIndexChange: (
    day: string,
    slotIndex: number | null,
    interactionMode: RecordCalendarWeekSlotInteractionMode,
  ) => void;
};

const RecordCalendarWeekDayColumn = memo(
  ({
    activeSlotIndex,
    calendarEndFieldName,
    calendarFieldName,
    calendarFieldType,
    dayString,
    onActiveSlotIndexChange,
    timeFormat,
    timeZone,
  }: RecordCalendarWeekDayColumnProps) => {
    const day = Temporal.PlainDate.from(dayString);
    const store = useStore();
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
            .filter(isDefined);

    const eventLayouts =
      computeRecordCalendarWeekEventLayouts(eventLayoutInputs);

    const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
      if (
        event.target instanceof Element &&
        event.target.closest('[data-selectable-id]') !== null
      ) {
        onActiveSlotIndexChange(dayString, null, 'pointer');
        return;
      }

      const columnRect = event.currentTarget.getBoundingClientRect();

      onActiveSlotIndexChange(
        dayString,
        getRecordCalendarWeekSlotIndex({
          columnHeight: columnRect.height,
          columnTop: columnRect.top,
          pointerY: event.clientY,
        }),
        'pointer',
      );
    };

    const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
      if (
        event.target === event.currentTarget &&
        event.currentTarget.matches(':focus-visible')
      ) {
        onActiveSlotIndexChange(
          dayString,
          activeSlotIndex ?? DEFAULT_KEYBOARD_SLOT_INDEX,
          'keyboard',
        );
      }
    };

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        onActiveSlotIndexChange(dayString, null, 'keyboard');
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

        onActiveSlotIndexChange(
          dayString,
          Math.min(
            slotCount - 1,
            Math.max(
              0,
              (activeSlotIndex ?? DEFAULT_KEYBOARD_SLOT_INDEX) + slotDelta,
            ),
          ),
          'keyboard',
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
        onMouseLeave={() => onActiveSlotIndexChange(dayString, null, 'pointer')}
        onMouseMove={handleMouseMove}
        tabIndex={0}
      >
        {isDefined(activeSlotIndex) && (
          <StyledSlotAddNewPositioner
            data-testid="record-calendar-week-slot-add"
            topInPixels={
              activeSlotIndex * RECORD_CALENDAR_WEEK_DIMENSIONS.slotHeight
            }
          >
            <RecordCalendarAddNew
              cardDate={day}
              cardTime={Temporal.PlainTime.from('00:00').add({
                minutes:
                  activeSlotIndex *
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
              recordId={recordId}
              startInPixels={startInPixels}
              timeFormat={timeFormat}
              timeZone={timeZone}
            />
          ),
        )}
      </StyledDayColumn>
    );
  },
);

export type RecordCalendarTimeGridDay = {
  date: Temporal.PlainDate;
  label: string;
};

type RecordCalendarTimeGridProps = {
  days: readonly RecordCalendarTimeGridDay[];
  minWidthInPixels?: number;
};

export const RecordCalendarTimeGrid = ({
  days,
  minWidthInPixels = 0,
}: RecordCalendarTimeGridProps) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const { timeFormat, timeZone } = useDateTimeFormat();
  const recordIndexCalendarFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarFieldMetadataIdComponentState,
  );
  const recordIndexCalendarEndFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarEndFieldMetadataIdComponentState,
  );
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [currentInstant, setCurrentInstant] = useState(() =>
    Temporal.Now.instant(),
  );
  const [activeSlot, setActiveSlot] =
    useState<RecordCalendarWeekActiveSlot | null>(null);

  const handleActiveSlotIndexChange = useCallback(
    (
      day: string,
      slotIndex: number | null,
      interactionMode: RecordCalendarWeekSlotInteractionMode,
    ) => {
      setActiveSlot((currentActiveSlot) =>
        updateRecordCalendarWeekActiveSlot({
          currentActiveSlot,
          day,
          interactionMode,
          slotIndex,
        }),
      );
    },
    [],
  );

  const clearActivePointerSlot = useCallback(() => {
    setActiveSlot((currentActiveSlot) =>
      currentActiveSlot?.interactionMode === 'pointer'
        ? null
        : currentActiveSlot,
    );
  }, []);

  useEffect(() => {
    const handleDocumentMouseMove = (event: globalThis.MouseEvent) => {
      const eventTarget = event.target;

      if (
        !(eventTarget instanceof Node) ||
        gridRef.current?.contains(eventTarget) !== true
      ) {
        clearActivePointerSlot();
      }
    };

    const clearActiveSlot = () => setActiveSlot(null);

    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseleave', clearActivePointerSlot);
    window.addEventListener('blur', clearActiveSlot);

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseleave', clearActivePointerSlot);
      window.removeEventListener('blur', clearActiveSlot);
    };
  }, [clearActivePointerSlot]);

  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarFieldMetadataId,
  );
  const calendarEndFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarEndFieldMetadataId,
  );

  const now = currentInstant.toZonedDateTimeISO(timeZone);
  const today = now.toPlainDate();
  const isCurrentPeriod = days.some(({ date }) => isSamePlainDate(date, today));
  const currentTimeTopInPixels =
    (now.hour + now.minute / 60) * RECORD_CALENDAR_WEEK_DIMENSIONS.hourHeight;
  const initialScrollHour = isCurrentPeriod ? Math.max(now.hour - 2, 0) : 8;
  const periodKey = days.map(({ date }) => date.toString()).join(',');

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
  }, [isTimedView, periodKey]);

  if (
    !isDefined(calendarFieldMetadataItem) ||
    (!isAllDayView && !isTimedView)
  ) {
    return null;
  }

  return (
    <RecordCalendarWeekDragDropContext
      days={days.map(({ date }) => date)}
      gridRef={gridRef}
    >
      <StyledContainer minWidthInPixels={minWidthInPixels}>
        <StyledHeader dayCount={days.length}>
          <StyledHeaderGutter>
            {isTimedView && <TimeZoneAbbreviation instant={currentInstant} />}
          </StyledHeaderGutter>
          {days.map(({ date, label }) => {
            const isToday = isSamePlainDate(date, today);

            return (
              <StyledDayHeader key={date.toString()}>
                <span>{label}</span>
                <StyledDayNumber isToday={isToday}>{date.day}</StyledDayNumber>
              </StyledDayHeader>
            );
          })}
        </StyledHeader>
        {isAllDayView && (
          <StyledAllDayGrid dayCount={days.length}>
            <StyledAllDayLabel>{t`All day`}</StyledAllDayLabel>
            {days.map(({ date }) => (
              <RecordCalendarTimeGridAllDayCell
                key={`all-day-${date.toString()}`}
                calendarFieldType={calendarFieldMetadataItem.type}
                day={date}
                timeZone={timeZone}
              />
            ))}
          </StyledAllDayGrid>
        )}
        {isTimedView && (
          <StyledGrid
            ref={gridRef}
            dayCount={days.length}
            onMouseLeave={clearActivePointerSlot}
          >
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
            {days.map(({ date }) => {
              const dateString = date.toString();

              return (
                <RecordCalendarWeekDayColumn
                  key={dateString}
                  activeSlotIndex={
                    activeSlot?.day === dateString ? activeSlot.slotIndex : null
                  }
                  calendarEndFieldName={compatibleCalendarEndFieldName}
                  calendarFieldName={calendarFieldMetadataItem.name}
                  calendarFieldType={calendarFieldMetadataItem.type}
                  dayString={dateString}
                  onActiveSlotIndexChange={handleActiveSlotIndexChange}
                  timeFormat={timeFormat}
                  timeZone={timeZone}
                />
              );
            })}
            {isCurrentPeriod && (
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
