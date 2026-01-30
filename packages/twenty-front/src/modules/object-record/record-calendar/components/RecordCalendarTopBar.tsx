import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { DatePickerWithoutCalendar } from '@/ui/input/components/internal/date/components/DatePickerWithoutCalendar';
import { TimeZoneAbbreviation } from '@/ui/input/components/internal/date/components/TimeZoneAbbreviation';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { format } from 'date-fns';
import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-shared/types';
import {
  isDefined,
  turnPlainDateToShiftedDateInSystemTimeZone,
} from 'twenty-shared/utils';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 24px;
  justify-content: space-between;
  width: 100%;
`;

const StyledNavigationButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledNavigationSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-end;
`;

export const RecordCalendarTopBar = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );

  const [recordCalendarSelectedDate, setRecordCalendarSelectedDate] =
    useRecoilComponentState(recordCalendarSelectedDateComponentState);

  const datePickerDropdownId = `record-calendar-date-picker-${recordCalendarId}`;
  const { closeDropdown } = useCloseDropdown();

  const handleDateChange = (plainDateString: Nullable<string>) => {
    if (isDefined(plainDateString)) {
      setRecordCalendarSelectedDate(Temporal.PlainDate.from(plainDateString));
    }
    closeDropdown(datePickerDropdownId);
  };

  const handlePreviousMonth = () => {
    setRecordCalendarSelectedDate(
      recordCalendarSelectedDate.subtract({ months: 1 }),
    );
  };

  const handleNextMonth = () => {
    setRecordCalendarSelectedDate(
      recordCalendarSelectedDate?.add({ months: 1 }),
    );
  };

  const handleTodayClick = () => {
    setRecordCalendarSelectedDate(Temporal.Now.plainDateISO());
  };

  const formattedDate = format(
    turnPlainDateToShiftedDateInSystemTimeZone(recordCalendarSelectedDate),
    'MMMM yyyy',
  );

  const dropdownContentOffset = { x: 140, y: 0 } satisfies DropdownOffset;

  return (
    <StyledContainer>
      <StyledLeftSection>
        <Dropdown
          dropdownId={datePickerDropdownId}
          clickableComponent={
            <SelectControl
              selectedOption={{
                label: formattedDate,
                value: formattedDate,
              }}
              selectSizeVariant="small"
            />
          }
          dropdownComponents={
            <DropdownContent widthInPixels={280}>
              <DatePickerWithoutCalendar
                instanceId={recordCalendarId}
                date={recordCalendarSelectedDate.toString()}
                onChange={handleDateChange}
                onClose={handleDateChange}
                onEnter={handleDateChange}
                onEscape={handleDateChange}
              />
            </DropdownContent>
          }
          dropdownOffset={dropdownContentOffset}
        />
        <TimeZoneAbbreviation instant={Temporal.Now.instant()} />
      </StyledLeftSection>

      <StyledNavigationSection>
        <StyledNavigationButton
          size="small"
          variant="tertiary"
          Icon={IconChevronLeft}
          onClick={handlePreviousMonth}
        />
        <Button
          size="small"
          variant="tertiary"
          title={t`Today`}
          onClick={handleTodayClick}
        />
        <StyledNavigationButton
          size="small"
          variant="tertiary"
          Icon={IconChevronRight}
          onClick={handleNextMonth}
        />
      </StyledNavigationSection>
    </StyledContainer>
  );
};
