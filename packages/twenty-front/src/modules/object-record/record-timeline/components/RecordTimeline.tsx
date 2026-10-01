import { useWeekStartsOnDayIndex } from '@/localization/hooks/useWeekStartsOnDayIndex';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatPlainDateRange } from '@/localization/utils/formatPlainDateRange';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTimelineRow } from '@/object-record/record-timeline/components/RecordTimelineRow';
import { RecordTimelineTopBar } from '@/object-record/record-timeline/components/RecordTimelineTopBar';
import { RECORD_TIMELINE_MIN_DAY_WIDTH_BY_ZOOM } from '@/object-record/record-timeline/constants/RecordTimelineMinDayWidthByZoom';
import { RECORD_TIMELINE_NAME_COLUMN_WIDTH } from '@/object-record/record-timeline/constants/RecordTimelineNameColumnWidth';
import { useRecordTimelineRecords } from '@/object-record/record-timeline/hooks/useRecordTimelineRecords';
import { type RecordTimelineZoom } from '@/object-record/record-timeline/types/RecordTimelineZoom';
import { getRecordTimelineBarPosition } from '@/object-record/record-timeline/utils/getRecordTimelineBarPosition';
import { getRecordTimelineWindow } from '@/object-record/record-timeline/utils/getRecordTimelineWindow';
import { parseRecordTimelineDate } from '@/object-record/record-timeline/utils/parseRecordTimelineDate';
import { shiftRecordTimelineAnchorDate } from '@/object-record/record-timeline/utils/shiftRecordTimelineAnchorDate';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { format } from 'date-fns';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import {
  isDefined,
  isSamePlainDate,
  turnPlainDateToShiftedDateInSystemTimeZone,
} from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

const StyledHeaderRow = styled.div<{ gridTemplateColumns: string }>`
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: grid;
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
  position: sticky;
  top: 0;
  z-index: 2;
`;

const StyledHeaderNameCell = styled.div`
  background: ${themeCssVariables.background.primary};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  left: 0;
  position: sticky;
`;

const StyledDayCell = styled.div<{ isToday: boolean }>`
  color: ${({ isToday }) =>
    isToday
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ isToday }) =>
    isToday ? themeCssVariables.font.weight.medium : 'inherit'};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[1]} 0;
  text-align: center;
  white-space: nowrap;
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

const StyledLoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]};
`;

type RecordTimelineProps = {
  startFieldMetadataItem: FieldMetadataItem;
  endFieldMetadataItem: FieldMetadataItem | undefined;
};

export const RecordTimeline = ({
  startFieldMetadataItem,
  endFieldMetadataItem,
}: RecordTimelineProps) => {
  const { recordIndexId, objectNameSingular } = useRecordIndexContextOrThrow();
  const { userTimezone } = useUserTimezone();
  const dateLocale = useAtomStateValue(dateLocaleState);

  const [zoom, setZoom] = useState<RecordTimelineZoom>('MONTH');
  const [anchorDate, setAnchorDate] = useState(() =>
    Temporal.Now.plainDateISO(userTimezone),
  );

  const weekStartsOnDayIndex = useWeekStartsOnDayIndex();

  const { firstDay, lastDay, days } = getRecordTimelineWindow({
    anchorDate,
    zoom,
    weekStartsOnDayIndex,
  });

  const { records, loading, hasNextPage, fetchMoreRecords } =
    useRecordTimelineRecords({
      startFieldMetadataItem,
      endFieldMetadataItem,
      windowFirstDay: firstDay,
      windowLastDay: lastDay,
    });

  const today = Temporal.Now.plainDateISO(userTimezone);

  const formatDay = (day: Temporal.PlainDate, pattern: string) =>
    format(turnPlainDateToShiftedDateInSystemTimeZone(day), pattern, {
      locale: dateLocale.localeCatalog,
    });

  const getDayLabel = (day: Temporal.PlainDate) => {
    switch (zoom) {
      case 'WEEK':
        return formatDay(day, 'EEE d');
      case 'MONTH':
        return formatDay(day, 'd');
      case 'QUARTER':
        return day.day === 1 ? formatDay(day, 'MMM') : '';
    }
  };

  const periodLabel =
    zoom === 'MONTH'
      ? formatDay(firstDay, 'MMMM yyyy')
      : formatPlainDateRange({
          firstDay,
          lastDay,
          locale: dateLocale.localeCatalog,
        });

  const gridTemplateColumns = `${RECORD_TIMELINE_NAME_COLUMN_WIDTH}px repeat(${days.length}, minmax(${RECORD_TIMELINE_MIN_DAY_WIDTH_BY_ZOOM[zoom]}px, 1fr))`;

  const rows = records.flatMap((record) => {
    const startDay = parseRecordTimelineDate({
      value: record[startFieldMetadataItem.name],
      fieldType: startFieldMetadataItem.type,
      timeZone: userTimezone,
    });

    if (!isDefined(startDay)) {
      return [];
    }

    const endDay = isDefined(endFieldMetadataItem)
      ? parseRecordTimelineDate({
          value: record[endFieldMetadataItem.name],
          fieldType: endFieldMetadataItem.type,
          timeZone: userTimezone,
        })
      : undefined;

    const barPosition = getRecordTimelineBarPosition({
      startDay,
      endDay,
      windowFirstDay: firstDay,
      windowLastDay: lastDay,
    });

    return isDefined(barPosition) ? [{ record, barPosition }] : [];
  });

  return (
    <StyledContainer>
      <RecordTimelineTopBar
        instanceId={recordIndexId}
        zoom={zoom}
        periodLabel={periodLabel}
        onZoomChange={setZoom}
        onPreviousPeriod={() =>
          setAnchorDate(
            shiftRecordTimelineAnchorDate({ anchorDate, zoom, direction: -1 }),
          )
        }
        onNextPeriod={() =>
          setAnchorDate(
            shiftRecordTimelineAnchorDate({ anchorDate, zoom, direction: 1 }),
          )
        }
        onToday={() => setAnchorDate(today)}
      />
      <StyledScrollArea>
        <StyledHeaderRow gridTemplateColumns={gridTemplateColumns}>
          <StyledHeaderNameCell />
          {days.map((day) => (
            <StyledDayCell
              key={day.toString()}
              isToday={isSamePlainDate(day, today)}
            >
              {getDayLabel(day)}
            </StyledDayCell>
          ))}
        </StyledHeaderRow>
        {rows.map(({ record, barPosition }) => (
          <RecordTimelineRow
            key={record.id}
            objectNameSingular={objectNameSingular}
            record={record}
            barPosition={barPosition}
            gridTemplateColumns={gridTemplateColumns}
          />
        ))}
        {!loading && rows.length === 0 && (
          <StyledEmptyState>{t`No records in this period`}</StyledEmptyState>
        )}
        {hasNextPage && (
          <StyledLoadMoreContainer>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fetchMoreRecords()}
            >{t`Load more`}</Button>
          </StyledLoadMoreContainer>
        )}
      </StyledScrollArea>
    </StyledContainer>
  );
};
