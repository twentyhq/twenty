import { RecordCalendarCard } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isSameDay, isSameMonth } from 'date-fns';

const StyledContainer = styled.div<{ isOtherMonth: boolean }>`
  display: flex;
  width: calc(100% / 7);
  flex-direction: column;
  min-height: 122px;
  padding: ${({ theme }) => theme.spacing(1)};
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

const StyledDayHeader = styled.div<{ isToday: boolean }>`
  display: flex;
  text-align: right;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  width: 20px;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};

  ${({ isToday, theme }) =>
    isToday &&
    css`
      border-radius: 4px;
      background: ${theme.color.red};
      color: ${theme.font.color.inverted};
      font-weight: ${theme.font.weight.medium};
    `}
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

  const isToday = isSameDay(day, new Date());

  const isOtherMonth = !isSameMonth(day, recordCalendarSelectedDate);

  return (
    <StyledContainer isOtherMonth={isOtherMonth}>
      <StyledDayHeader isToday={isToday}>{day.getDate()}</StyledDayHeader>
      <StyledCardsContainer>
        {recordIds.slice(0, 5).map((recordId) => (
          <RecordCalendarCard key={recordId} recordId={recordId} />
        ))}
      </StyledCardsContainer>
    </StyledContainer>
  );
};
