import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { recordIndexCalendarLayoutState } from '@/object-record/record-index/states/recordIndexCalendarLayoutState';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { Select } from '@/ui/input/components/Select';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { addMonths, format, subMonths } from 'date-fns';
import { useRecoilValue } from 'recoil';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { ViewCalendarLayout } from '~/generated/graphql';

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

  const recordIndexCalendarLayout = useRecoilValue(
    recordIndexCalendarLayoutState,
  );

  const [recordCalendarSelectedDate, setRecordCalendarSelectedDate] =
    useRecoilComponentState(recordCalendarSelectedDateComponentState);

  const datePickerDropdownId = `record-calendar-date-picker-${recordCalendarId}`;
  const { closeDropdown } = useCloseDropdown();

  const handleDateChange = (date: Nullable<Date>) => {
    if (isDefined(date)) {
      setRecordCalendarSelectedDate(date);
    }
    closeDropdown(datePickerDropdownId);
  };

  const handlePreviousMonth = () => {
    setRecordCalendarSelectedDate(subMonths(recordCalendarSelectedDate, 1));
  };

  const handleNextMonth = () => {
    setRecordCalendarSelectedDate(addMonths(recordCalendarSelectedDate, 1));
  };

  const handleTodayClick = () => {
    setRecordCalendarSelectedDate(new Date());
  };

  const formattedDate = format(recordCalendarSelectedDate, 'MMMM yyyy');

  const dropdownContentOffset = { x: 140, y: 0 } satisfies DropdownOffset;

  return (
    <StyledContainer>
      <StyledLeftSection>
        <Select
          dropdownId={`record-calendar-top-bar-layout-select-${recordCalendarId}`}
          selectSizeVariant="small"
          options={[
            {
              label: 'Month',
              value: ViewCalendarLayout.MONTH,
            },
            {
              label: 'Week',
              value: ViewCalendarLayout.WEEK,
            },
            {
              label: 'Timeline',
              value: ViewCalendarLayout.DAY,
            },
          ]}
          disabled
          value={recordIndexCalendarLayout}
          onChange={() => {}}
        />
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
              <DateTimePicker
                date={recordCalendarSelectedDate}
                onChange={handleDateChange}
                onClose={handleDateChange}
                onEnter={handleDateChange}
                onEscape={handleDateChange}
                clearable={false}
                hideHeaderInput
              />
            </DropdownContent>
          }
          dropdownOffset={dropdownContentOffset}
        />
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
          title="Today"
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
