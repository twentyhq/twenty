import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { isRecordCalendarReadOnlyComponentState } from '@/object-record/record-calendar/states/isRecordCalendarReadOnlyComponentState';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { getSupportedRecordCalendarLayout } from '@/object-record/record-calendar/utils/getSupportedRecordCalendarLayout';
import { useRecordCalendarWeekDaysRange } from '@/object-record/record-calendar/week/hooks/useRecordCalendarWeekDaysRange';
import { formatRecordCalendarWeekRange } from '@/object-record/record-calendar/week/utils/formatRecordCalendarWeekRange';
import { recordIndexCalendarLayoutComponentState } from '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { DatePickerWithoutCalendar } from '@/ui/input/components/internal/date/components/DatePickerWithoutCalendar';
import { TimeZoneAbbreviation } from '@/ui/input/components/internal/date/components/TimeZoneAbbreviation';
import { Select } from '@/ui/input/components/Select';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
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
import {
  FeatureFlagKey,
  ViewCalendarLayout,
} from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

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

  const isRecordCalendarReadOnly = useAtomComponentStateValue(
    isRecordCalendarReadOnlyComponentState,
  );

  // The layout switcher persists via updateCurrentView (an index-page write),
  // so it must never render inside a dashboard widget; widget calendars drive
  // their layout from the side-panel settings instead.
  const widgetInstanceId = useAvailableComponentInstanceId(
    WidgetComponentInstanceContext,
  );
  const isInWidget = isDefined(widgetInstanceId);

  const [recordIndexCalendarLayout, setRecordIndexCalendarLayout] =
    useAtomComponentState(recordIndexCalendarLayoutComponentState);
  const isCalendarWeekViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
  );
  const supportedCalendarLayout = getSupportedRecordCalendarLayout({
    calendarLayout: recordIndexCalendarLayout,
    isCalendarWeekViewEnabled,
  });

  const dateLocale = useAtomStateValue(dateLocaleState);
  const { timeZone } = useDateTimeFormat();
  const { firstDayOfWeek, lastDayOfWeek } = useRecordCalendarWeekDaysRange(
    recordCalendarSelectedDate,
  );

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
    const previousDate =
      supportedCalendarLayout === ViewCalendarLayout.DAY
        ? recordCalendarSelectedDate.subtract({ days: 1 })
        : supportedCalendarLayout === ViewCalendarLayout.WEEK
          ? recordCalendarSelectedDate.subtract({ weeks: 1 })
          : recordCalendarSelectedDate.subtract({ months: 1 });

    setRecordCalendarSelectedDate(previousDate);
  };

  const handleNextPeriod = () => {
    const nextDate =
      supportedCalendarLayout === ViewCalendarLayout.DAY
        ? recordCalendarSelectedDate.add({ days: 1 })
        : supportedCalendarLayout === ViewCalendarLayout.WEEK
          ? recordCalendarSelectedDate.add({ weeks: 1 })
          : recordCalendarSelectedDate.add({ months: 1 });

    setRecordCalendarSelectedDate(nextDate);
  };

  const handleCalendarLayoutChange = (calendarLayout: ViewCalendarLayout) => {
    const isTimeGridLayout =
      calendarLayout === ViewCalendarLayout.DAY ||
      calendarLayout === ViewCalendarLayout.WEEK;

    if (isTimeGridLayout && !isCalendarWeekViewEnabled) {
      return;
    }

    setRecordIndexCalendarLayout(calendarLayout);
    void updateCurrentView({ calendarLayout });
  };

  const handleTodayClick = () => {
    setRecordCalendarSelectedDate(Temporal.Now.plainDateISO(timeZone));
  };

  const formattedDate =
    supportedCalendarLayout === ViewCalendarLayout.DAY
      ? recordCalendarSelectedDate.toLocaleString(dateLocale.locale, {
          dateStyle: 'full',
        })
      : supportedCalendarLayout === ViewCalendarLayout.WEEK
        ? formatRecordCalendarWeekRange({
            firstDayOfWeek,
            lastDayOfWeek,
            locale: dateLocale.localeCatalog,
          })
        : format(
            turnPlainDateToShiftedDateInSystemTimeZone(
              recordCalendarSelectedDate,
            ),
            'MMMM yyyy',
            { locale: dateLocale.localeCatalog },
          );

  const dropdownContentOffset = { x: 140, y: 0 } satisfies DropdownOffset;

  return (
    <StyledContainer>
      <StyledLeftSection>
        {isCalendarWeekViewEnabled &&
          !isRecordCalendarReadOnly &&
          !isInWidget && (
            <Select
              dropdownId={`record-calendar-layout-${recordCalendarId}`}
              value={supportedCalendarLayout}
              options={[
                { label: t`Day`, value: ViewCalendarLayout.DAY },
                { label: t`Week`, value: ViewCalendarLayout.WEEK },
                { label: t`Month`, value: ViewCalendarLayout.MONTH },
              ]}
              selectSizeVariant="small"
              dropdownWidth={120}
              onChange={handleCalendarLayoutChange}
            />
          )}
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
        {supportedCalendarLayout === ViewCalendarLayout.MONTH && (
          <TimeZoneAbbreviation instant={Temporal.Now.instant()} />
        )}
      </StyledLeftSection>

      <StyledNavigationSection>
        <StyledNavigationButtonContainer>
          <Button
            ariaLabel={t`Previous period`}
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
            ariaLabel={t`Next period`}
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
