import { RecordCalendarCard } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

const StyledContainer = styled.div<{ isOtherMonth: boolean }>`
  display: flex;
  width: calc(100% / 7);
  flex-direction: column;
  min-height: 122px;
  padding: ${({ theme }) => theme.spacing(0.5)};
  background: ${({ theme }) => theme.background.primary};

  &:not(:last-child) {
    border-right: 0.5px solid ${({ theme }) => theme.border.color.light};
  }

  ${({ isOtherMonth, theme }) =>
    isOtherMonth &&
    css`
      background: ${theme.background.secondary};
      color: ${theme.font.color.light};
    `}
`;

const StyledDayHeader = styled.div`
  display: flex;
  text-align: right;
  justify-content: flex-end;
  padding: 7px 5px;
`;

const StyledCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type RecordCalendarMonthBodyDayProps = {
  day: Date;
};

export const RecordCalendarMonthBodyDay = ({
  day,
}: RecordCalendarMonthBodyDayProps) => {
  const recordCalendarSelectedDate = useRecoilComponentValue(
    recordCalendarSelectedDateComponentState,
  );

  const recordIds = useRecoilComponentFamilyValue(
    calendarDayRecordIdsComponentFamilySelector,
    day.toDateString(),
  );

  const isOtherMonth = day.getMonth() !== recordCalendarSelectedDate.getMonth();

  return (
    <StyledContainer isOtherMonth={isOtherMonth}>
      <StyledDayHeader>{day.getDate()}</StyledDayHeader>
      <StyledCardsContainer>
        {recordIds.slice(0, 5).map((recordId) => (
          <RecordCalendarCard key={recordId} recordId={recordId} />
        ))}
      </StyledCardsContainer>
    </StyledContainer>
  );
};
