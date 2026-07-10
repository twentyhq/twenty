import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { recordIndexCalendarLayoutState } from '@/object-record/record-index/states/recordIndexCalendarLayoutState';
import { DatePickerWithoutCalendar } from '@/ui/input/components/internal/date/components/DatePickerWithoutCalendar';
import { TimeZoneAbbreviation } from '@/ui/input/components/internal/date/components/TimeZoneAbbreviation';
import { Select } from '@/ui/input/components/Select';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { format } from 'date-fns';
import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-shared/types';
import {
  isDefined,
  turnPlainDateToShiftedDateInSystemTimeZone,
} from 'twenty-shared/utils';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 24px;
  justify-content: space-between;
  width: 100%;
`;

const StyledNavigationButtonContainer = styled.div`
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledLeftSection = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNavigationSection = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-end;
`;

export const RecordCalendarTopBar = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );

  const [recordCalendarSelectedDate, setRecordCalendarSelectedDate] =
    useAtomComponentState(recordCalendarSelectedDateComponentState);

  const [recordIndexCalendarLayout, setRecordIndexCalendarLayout] =
    useAtomState(recordIndexCalendarLayoutState);

  const { updateCurrentView } = useUpdateCurrentView();

  const datePickerDropdownId = `record-calendar-date-picker-${recordCalendarId}`;
  const { closeDropdown } = useCloseDropdown();

  const handleDateChange = (plainDateString: Nullable<string>) => {
    if (isDefined(plainDateString)) {
      setRecordCalendarSelectedDate(Temporal.PlainDate.from(plainDateString));
    }
    closeDropdown(datePickerDropdownId);
  };

  const handlePreviousPeriod = () => {
    setRecordCalendarSelectedDate(
      recordIndexCalendarLayout === ViewCalendarLayout.WEEK
        ? recordCalendarSelectedDate.subtract({ weeks: 1 })
        : recordCalendarSelectedDate.subtract({ months: 1 }),
    );
  };

  const handleNextPeriod = () => {
    setRecordCalendarSelectedDate(
      recordIndexCalendarLayout === ViewCalendarLayout.WEEK
        ? recordCalendarSelectedDate.add({ weeks: 1 })
        : recordCalendarSelectedDate.add({ months: 1 }),
    );
  };

  const handleCalendarLayoutChange = (calendarLayout: ViewCalendarLayout) => {
    setRecordIndexCalendarLayout(calendarLayout);
    void updateCurrentView({ calendarLayout });
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
        <Select
          dropdownId={`record-calendar-layout-${recordCalendarId}`}
          value={recordIndexCalendarLayout}
          options={[
            { label: t`Week`, value: ViewCalendarLayout.WEEK },
            { label: t`Month`, value: ViewCalendarLayout.MONTH },
          ]}
          selectSizeVariant="small"
          dropdownWidth={120}
          onChange={handleCalendarLayoutChange}
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
        {recordIndexCalendarLayout !== ViewCalendarLayout.WEEK && (
          <TimeZoneAbbreviation instant={Temporal.Now.instant()} />
        )}
      </StyledLeftSection>

      <StyledNavigationSection>
        <StyledNavigationButtonContainer>
          <Button
            size="small"
            variant="tertiary"
            Icon={IconChevronLeft}
            onClick={handlePreviousPeriod}
          />
        </StyledNavigationButtonContainer>
        <Button
          size="small"
          variant="tertiary"
          title={t`Today`}
          onClick={handleTodayClick}
        />
        <StyledNavigationButtonContainer>
          <Button
            size="small"
            variant="tertiary"
            Icon={IconChevronRight}
            onClick={handleNextPeriod}
          />
        </StyledNavigationButtonContainer>
      </StyledNavigationSection>
    </StyledContainer>
  );
};
