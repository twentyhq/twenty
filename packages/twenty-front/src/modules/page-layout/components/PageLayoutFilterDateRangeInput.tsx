import { buildPageLayoutFilterDateRangeValue } from '@/page-layout/utils/buildPageLayoutFilterDateRangeValue';
import { DatePickerCalendar } from '@/ui/input/components/internal/date/components/DatePickerCalendar';
import { DatePickerClearButton } from '@/ui/input/components/internal/date/components/DatePickerClearButton';
import { DatePickerHeader } from '@/ui/input/components/internal/date/components/DatePickerHeader';
import { DatePickerInput } from '@/ui/input/components/internal/date/components/DatePickerInput';
import { DatePickerLoadingFallback } from '@/ui/input/components/internal/date/components/DatePickerLoadingFallback';
import { StyledDatePickerContainer } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import {
  getDashboardFilterConditionValueIssue,
  isDefined,
} from 'twenty-shared/utils';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { type PageLayoutFilterValue } from '~/generated-metadata/graphql';

const StyledBounds = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
`;

const StyledBoundRow = styled.label`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  column-gap: ${themeCssVariables.spacing[2]};
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[2]};

  &[data-active] {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledBoundLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

// The relative picker's covered days (its read-only month at half opacity), here between the two bounds
const StyledCalendarContainer = styled(StyledDatePickerContainer)`
  .react-datepicker__day--in-range:hover {
    background-color: ${themeCssVariables.color.blue};
  }

  .react-datepicker__day--in-range:not(
    .react-datepicker__day--range-start,
    .react-datepicker__day--range-end
  ) {
    opacity: 0.5;
  }
`;

const StyledError = styled.div`
  padding: 0 ${themeCssVariables.spacing[2]};
`;

type DateRange = { startDate: string | null; endDate: string | null };

type PageLayoutFilterDateRangeInputProps = {
  dateRange: DateRange;
  onChange: (value: PageLayoutFilterValue | null) => void;
};

export const PageLayoutFilterDateRangeInput = ({
  dateRange,
  onChange,
}: PageLayoutFilterDateRangeInputProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const [activeBound, setActiveBound] = useState<keyof DateRange>('startDate');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // The inputs keep their own text, so a refused date remounts them on the stored range
  const [inputsKey, setInputsKey] = useState(0);

  const { startDate, endDate } = dateRange;
  const activeBoundDate = dateRange[activeBound];

  const handleBoundChange = (bound: keyof DateRange, date: string | null) => {
    const newDateRange = { ...dateRange, [bound]: date };
    const dateRangeValue = buildPageLayoutFilterDateRangeValue(newDateRange);
    const isEndBeforeStart =
      isNonEmptyString(newDateRange.startDate) &&
      isNonEmptyString(newDateRange.endDate) &&
      newDateRange.endDate < newDateRange.startDate;
    const isOutOfSupportedYears = (dateRangeValue?.conditions ?? []).some(
      (condition) =>
        isDefined(getDashboardFilterConditionValueIssue(condition)),
    );

    if (isEndBeforeStart || isOutOfSupportedYears) {
      setErrorMessage(
        isOutOfSupportedYears
          ? t`Dates must be between the years 0001 and 9999.`
          : t`End date must be after start date.`,
      );
      setInputsKey((previousInputsKey) => previousInputsKey + 1);
      return;
    }

    setErrorMessage(null);
    onChange(dateRangeValue);

    if (bound === 'startDate' && isDefined(date)) {
      setActiveBound('endDate');
    }
  };

  const handleClear = () => {
    setErrorMessage(null);
    setActiveBound('startDate');
    setInputsKey((previousInputsKey) => previousInputsKey + 1);
    onChange(null);
  };

  const bounds: { bound: keyof DateRange; label: string }[] = [
    { bound: 'startDate', label: t`Start date` },
    { bound: 'endDate', label: t`End date` },
  ];

  return (
    <>
      <StyledBounds key={inputsKey}>
        {bounds.map(({ bound, label }) => (
          <StyledBoundRow
            key={bound}
            data-active={bound === activeBound ? '' : undefined}
            onFocus={() => setActiveBound(bound)}
          >
            <StyledBoundLabel aria-hidden>{label}</StyledBoundLabel>
            <DatePickerInput
              variant="transparent"
              aria-label={label}
              date={dateRange[bound]}
              onChange={(date) => handleBoundChange(bound, date)}
            />
          </StyledBoundRow>
        ))}
      </StyledBounds>
      {isNonEmptyString(errorMessage) && (
        <Field.Root render={<StyledError />}>
          <Field.Error match role="alert">
            {errorMessage}
          </Field.Error>
        </Field.Root>
      )}
      <StyledCalendarContainer>
        <DatePickerCalendar
          loadingFallback={<DatePickerLoadingFallback />}
          key={activeBoundDate ?? startDate ?? endDate}
          value={activeBoundDate}
          viewedDate={activeBoundDate ?? startDate ?? endDate}
          highlightedRange={
            isDefined(startDate) && isDefined(endDate) && startDate <= endDate
              ? { start: startDate, end: endDate }
              : undefined
          }
          onSelect={(date) => handleBoundChange(activeBound, date)}
          renderHeader={(header) => (
            <DatePickerHeader
              instanceId={instanceId}
              date={activeBoundDate}
              viewedMonth={header.viewedMonth}
              onChangeMonth={header.onMonthChange}
              onChangeYear={header.onYearChange}
              onAddMonth={header.onNextMonth}
              onSubtractMonth={header.onPreviousMonth}
              prevMonthButtonDisabled={header.isPreviousMonthDisabled}
              nextMonthButtonDisabled={header.isNextMonthDisabled}
              hideInput
            />
          )}
        />
        <DatePickerClearButton onClear={handleClear} />
      </StyledCalendarContainer>
    </>
  );
};
