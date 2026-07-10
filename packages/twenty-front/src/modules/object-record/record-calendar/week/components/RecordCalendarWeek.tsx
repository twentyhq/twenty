import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import {
  RECORD_CALENDAR_WEEK_HOUR_HEIGHT,
  RecordCalendarWeekEvent,
} from '@/object-record/record-calendar/week/components/RecordCalendarWeekEvent';
import { useRecordCalendarWeekDaysRange } from '@/object-record/record-calendar/week/hooks/useRecordCalendarWeekDaysRange';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { TimeZoneAbbreviation } from '@/ui/input/components/internal/date/components/TimeZoneAbbreviation';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useEffect, useRef } from 'react';
import { Temporal } from 'temporal-polyfill';
import {
  isDefined,
  isPlainDateInWeekend,
  isSamePlainDate,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const TIME_GUTTER_WIDTH = 56;
const HOURS_IN_DAY = 24;
const WEEK_GRID_HEIGHT = HOURS_IN_DAY * RECORD_CALENDAR_WEEK_HOUR_HEIGHT;

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
  grid-template-columns: ${TIME_GUTTER_WIDTH}px repeat(7, minmax(120px, 1fr));
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
  grid-template-columns: ${TIME_GUTTER_WIDTH}px repeat(7, minmax(120px, 1fr));
  height: ${WEEK_GRID_HEIGHT}px;
  position: relative;
`;

const StyledTimeGutter = styled.div`
  height: ${WEEK_GRID_HEIGHT}px;
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
    transparent ${RECORD_CALENDAR_WEEK_HOUR_HEIGHT}px
  );
  border-left: 1px solid ${themeCssVariables.border.color.light};
  height: ${WEEK_GRID_HEIGHT}px;
  position: relative;
`;

const StyledCurrentTimeLine = styled.div<{ topInPixels: number }>`
  background: ${themeCssVariables.color.red8};
  height: 1px;
  left: ${TIME_GUTTER_WIDTH}px;
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
  right: calc(100% - ${TIME_GUTTER_WIDTH - 1}px);
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
  calendarFieldName: string;
  calendarFieldType: FieldMetadataType;
  day: Temporal.PlainDate;
  timeFormat: string;
  timeZone: string;
};

type RecordCalendarWeekAllDayCellProps = WeekDayCellProps;
type RecordCalendarWeekDayColumnProps = WeekDayCellProps;

const RecordCalendarWeekAllDayCell = ({
  calendarFieldName,
  calendarFieldType,
  day,
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
          calendarFieldName={calendarFieldName}
          calendarFieldType={calendarFieldType}
          isAllDay
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
  calendarFieldName,
  calendarFieldType,
  day,
  timeFormat,
  timeZone,
}: RecordCalendarWeekDayColumnProps) => {
  const recordIds = useAtomComponentFamilySelectorValue(
    calendarDayRecordIdsComponentFamilySelector,
    { day, timeZone },
  );

  return (
    <StyledDayColumn isWeekend={isPlainDateInWeekend(day)}>
      {recordIds.map((recordId) => (
        <RecordCalendarWeekEvent
          key={recordId}
          calendarFieldName={calendarFieldName}
          calendarFieldType={calendarFieldType}
          isAllDay={false}
          recordId={recordId}
          timeFormat={timeFormat}
          timeZone={timeZone}
        />
      ))}
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
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const { firstDayOfWeek, lastDayOfWeek, weekDays } =
    useRecordCalendarWeekDaysRange(recordCalendarSelectedDate);

  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarFieldMetadataId,
  );

  const now = Temporal.Now.zonedDateTimeISO(timeZone);
  const today = now.toPlainDate();
  const isCurrentWeek =
    Temporal.PlainDate.compare(today, firstDayOfWeek) >= 0 &&
    Temporal.PlainDate.compare(today, lastDayOfWeek) <= 0;
  const currentTimeTopInPixels =
    (now.hour + now.minute / 60) * RECORD_CALENDAR_WEEK_HOUR_HEIGHT;
  const initialScrollHour = isCurrentWeek ? Math.max(now.hour - 2, 0) : 8;
  const firstDayOfWeekString = firstDayOfWeek.toString();

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({
      block: 'center',
      inline: 'nearest',
    });
  }, [firstDayOfWeekString]);

  if (!isDefined(calendarFieldMetadataItem)) {
    return null;
  }

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledHeaderGutter>
          <TimeZoneAbbreviation instant={Temporal.Now.instant()} />
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
        <StyledAllDayLabel>{t`All day`}</StyledAllDayLabel>
        {weekDays.map(({ date }) => (
          <RecordCalendarWeekAllDayCell
            key={`all-day-${date.toString()}`}
            calendarFieldName={calendarFieldMetadataItem.name}
            calendarFieldType={calendarFieldMetadataItem.type}
            day={date}
            timeFormat={timeFormat}
            timeZone={timeZone}
          />
        ))}
      </StyledHeader>
      <StyledGrid>
        <StyledTimeGutter>
          {Array.from({ length: HOURS_IN_DAY }, (_, hour) => (
            <StyledHourLabel
              key={hour}
              topInPixels={hour * RECORD_CALENDAR_WEEK_HOUR_HEIGHT}
            >
              {format(new Date(2000, 0, 1, hour), timeFormat)}
            </StyledHourLabel>
          ))}
          <StyledScrollAnchor
            ref={scrollAnchorRef}
            topInPixels={initialScrollHour * RECORD_CALENDAR_WEEK_HOUR_HEIGHT}
          />
        </StyledTimeGutter>
        {weekDays.map(({ date }) => (
          <RecordCalendarWeekDayColumn
            key={date.toString()}
            calendarFieldName={calendarFieldMetadataItem.name}
            calendarFieldType={calendarFieldMetadataItem.type}
            day={date}
            timeFormat={timeFormat}
            timeZone={timeZone}
          />
        ))}
        {isCurrentWeek && (
          <>
            <StyledCurrentTimeLine topInPixels={currentTimeTopInPixels} />
            <StyledCurrentTimeLabel topInPixels={currentTimeTopInPixels}>
              {formatInTimeZone(new Date(), timeZone, timeFormat)}
            </StyledCurrentTimeLabel>
          </>
        )}
      </StyledGrid>
    </StyledContainer>
  );
};
