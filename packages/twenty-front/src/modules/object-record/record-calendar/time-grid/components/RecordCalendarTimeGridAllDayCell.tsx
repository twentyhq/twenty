import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { RecordCalendarWeekEvent } from '@/object-record/record-calendar/week/components/RecordCalendarWeekEvent';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const StyledAllDayCell = styled.div`
  border-left: 1px solid ${themeCssVariables.border.color.light};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  min-height: 28px;
  min-width: 0;
  padding: ${themeCssVariables.spacing['0.5']};
`;

type RecordCalendarTimeGridAllDayCellProps = {
  calendarFieldName: string;
  calendarFieldType: FieldMetadataType;
  day: Temporal.PlainDate;
  timeFormat: string;
  timeZone: string;
};

export const RecordCalendarTimeGridAllDayCell = ({
  calendarFieldName,
  calendarFieldType,
  day,
  timeFormat,
  timeZone,
}: RecordCalendarTimeGridAllDayCellProps) => {
  const recordIds = useAtomComponentFamilySelectorValue(
    calendarDayRecordIdsComponentFamilySelector,
    { day, timeZone },
  );

  const allDayRecordIds =
    calendarFieldType === FieldMetadataType.DATE ? recordIds : [];

  return (
    <StyledAllDayCell>
      {allDayRecordIds.map((recordId) => (
        <RecordCalendarWeekEvent
          key={recordId}
          calendarDay={day}
          calendarFieldName={calendarFieldName}
          calendarFieldType={calendarFieldType}
          isAllDay
          recordId={recordId}
          timeFormat={timeFormat}
          timeZone={timeZone}
        />
      ))}
    </StyledAllDayCell>
  );
};
