import { CalendarEventsDateInput } from '@/activities/calendar/components/CalendarEventsDateInput';
import { type CalendarEventsCustomDateRange } from '@/activities/calendar/types/CalendarEventsCustomDateRange';
import { type CalendarEventsDateRangePreset } from '@/activities/calendar/types/CalendarEventsDateRangePreset';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  padding-bottom: ${themeCssVariables.spacing[4]};
`;

type CalendarEventsDateRangeFilterProps = {
  instanceId: string;
  preset: CalendarEventsDateRangePreset;
  customDateRange: CalendarEventsCustomDateRange;
  onPresetChange: (preset: CalendarEventsDateRangePreset) => void;
  onCustomDateRangeChange: (
    customDateRange: CalendarEventsCustomDateRange,
  ) => void;
};

export const CalendarEventsDateRangeFilter = ({
  instanceId,
  preset,
  customDateRange,
  onPresetChange,
  onCustomDateRangeChange,
}: CalendarEventsDateRangeFilterProps) => {
  const { t } = useLingui();

  const presetOptions: SelectOption<CalendarEventsDateRangePreset>[] = [
    { label: t`All time`, value: 'ALL' },
    { label: t`Today`, value: 'TODAY' },
    { label: t`This week`, value: 'THIS_WEEK' },
    { label: t`This month`, value: 'THIS_MONTH' },
    { label: t`Custom range`, value: 'CUSTOM' },
  ];

  const handleStartPlainDateChange = (startPlainDate: string | undefined) => {
    onCustomDateRangeChange({ ...customDateRange, startPlainDate });
  };

  const handleEndPlainDateChange = (endPlainDate: string | undefined) => {
    onCustomDateRangeChange({ ...customDateRange, endPlainDate });
  };

  return (
    <StyledContainer>
      <Select
        dropdownId={`calendar-events-date-range-${instanceId}`}
        value={preset}
        options={presetOptions}
        selectSizeVariant="small"
        dropdownWidth={GenericDropdownContentWidth.Narrow}
        onChange={onPresetChange}
      />
      {preset === 'CUSTOM' && (
        <>
          <CalendarEventsDateInput
            dropdownId={`calendar-events-date-range-start-${instanceId}`}
            plainDate={customDateRange.startPlainDate}
            placeholder={t`Start date`}
            onChange={handleStartPlainDateChange}
          />
          <CalendarEventsDateInput
            dropdownId={`calendar-events-date-range-end-${instanceId}`}
            plainDate={customDateRange.endPlainDate}
            placeholder={t`End date`}
            onChange={handleEndPlainDateChange}
          />
        </>
      )}
    </StyledContainer>
  );
};
