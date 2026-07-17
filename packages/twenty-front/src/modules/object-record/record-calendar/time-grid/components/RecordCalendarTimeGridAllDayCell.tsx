import { RecordCalendarCard } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const StyledAllDayCell = styled.div`
  border-left: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  min-height: 28px;
  min-width: 0;
  padding: ${themeCssVariables.spacing['0.5']};
`;

const StyledCardContainer = styled.div`
  min-width: 0;
  position: relative;
`;

type RecordCalendarTimeGridAllDayCellProps = {
  calendarFieldType: FieldMetadataType;
  day: Temporal.PlainDate;
  timeZone: string;
};

export const RecordCalendarTimeGridAllDayCell = ({
  calendarFieldType,
  day,
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
        <StyledCardContainer key={recordId} data-selectable-id={recordId}>
          <RecordCalendarCard recordId={recordId} />
        </StyledCardContainer>
      ))}
    </StyledAllDayCell>
  );
};
