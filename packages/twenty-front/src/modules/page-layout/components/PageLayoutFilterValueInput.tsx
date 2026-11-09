import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { FormRelativeDatePicker } from '@/object-record/record-field/ui/form-types/components/FormRelativeDatePicker';
import { useGetRelativeDateFilterWithUserTimezone } from '@/object-record/record-filter/hooks/useGetRelativeDateFilterWithUserTimezone';
import { type PageLayoutFilterValueMode } from '@/page-layout/types/PageLayoutFilterValueMode';
import { buildPageLayoutFilterDateRangeValue } from '@/page-layout/utils/buildPageLayoutFilterDateRangeValue';
import { getPageLayoutFilterDateRange } from '@/page-layout/utils/getPageLayoutFilterDateRange';
import { getPageLayoutFilterValueMode } from '@/page-layout/utils/getPageLayoutFilterValueMode';
import { stringifyPageLayoutFilterRelativeDateValue } from '@/page-layout/utils/stringifyPageLayoutFilterRelativeDateValue';
import { Select } from '@/ui/input/components/Select';
import { stringifyRelativeDateFilterWithDetectedStartDay } from '@/views/view-filter-value/utils/stringifyRelativeDateFilterWithDetectedStartDay';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { DASHBOARD_FILTER_RELATIVE_DATE_AMOUNT_MAX } from 'twenty-shared/constants';
import {
  getDashboardFilterConditionValueIssue,
  isDefined,
  type RelativeDateFilter,
  relativeDateFilterStringifiedSchema,
} from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledDateRangeRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr;
`;

const StyledError = styled.span`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

type PageLayoutFilterValueInputProps = {
  label?: string;
  emptyValueLabel: string;
  value: Pick<PageLayoutFilterValue, 'conditions'> | null | undefined;
  onChange: (value: PageLayoutFilterValue | null) => void;
};

export const PageLayoutFilterValueInput = ({
  label,
  emptyValueLabel,
  value,
  onChange,
}: PageLayoutFilterValueInputProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const { getRelativeDateFilterWithUserTimezone } =
    useGetRelativeDateFilterWithUserTimezone();
  const [chosenMode, setChosenMode] =
    useState<PageLayoutFilterValueMode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // The pickers keep their own draft, so a refused input remounts them on the stored value
  const [pickersKey, setPickersKey] = useState(0);

  const showError = (message: string | null) => {
    setErrorMessage(message);

    if (isDefined(message)) {
      setPickersKey((previousPickersKey) => previousPickersKey + 1);
    }
  };

  const valueMode = getPageLayoutFilterValueMode(value ?? null);
  const mode = chosenMode ?? valueMode;
  const storedDateRange = getPageLayoutFilterDateRange(value ?? null);
  const { startDate, endDate } = storedDateRange;

  const storedRelativeDateFilter =
    relativeDateFilterStringifiedSchema.safeParse(value?.conditions[0]?.value);

  // The range preview reads the editor's timezone and week start, never stored
  const relativeDateDisplayValue =
    storedRelativeDateFilter.success &&
    !isNonEmptyString(storedRelativeDateFilter.data.timezone)
      ? stringifyRelativeDateFilterWithDetectedStartDay(
          getRelativeDateFilterWithUserTimezone(storedRelativeDateFilter.data),
        )
      : value?.conditions[0]?.value;

  const customModeOption: SelectOption<PageLayoutFilterValueMode> = {
    label: t`Custom`,
    value: 'CUSTOM',
  };

  const modeOptions: SelectOption<PageLayoutFilterValueMode>[] = [
    { label: emptyValueLabel, value: 'NONE' },
    { label: t`Relative date`, value: 'RELATIVE' },
    { label: t`Date range`, value: 'DATE_RANGE' },
    ...(valueMode === 'CUSTOM' ? [customModeOption] : []),
  ];

  const handleRelativeDateChange = (relativeDateFilter: RelativeDateFilter) => {
    const isAmountTooLarge =
      (relativeDateFilter.amount ?? 1) >
      DASHBOARD_FILTER_RELATIVE_DATE_AMOUNT_MAX;

    onChange({
      conditions: [
        {
          operand: ViewFilterOperand.IS_RELATIVE,
          value: stringifyPageLayoutFilterRelativeDateValue({
            ...relativeDateFilter,
            amount: isAmountTooLarge
              ? DASHBOARD_FILTER_RELATIVE_DATE_AMOUNT_MAX
              : relativeDateFilter.amount,
          }),
        },
      ],
    });

    showError(
      isAmountTooLarge
        ? t`Use an amount of ${DASHBOARD_FILTER_RELATIVE_DATE_AMOUNT_MAX} or less.`
        : null,
    );
  };

  const handleDateRangeChange = (dateRange: typeof storedDateRange) => {
    setChosenMode('DATE_RANGE');

    if (
      isNonEmptyString(dateRange.startDate) &&
      isNonEmptyString(dateRange.endDate) &&
      Temporal.PlainDate.compare(dateRange.endDate, dateRange.startDate) < 0
    ) {
      showError(t`The end date must be on or after the start date.`);
      return;
    }

    const dateRangeValue = buildPageLayoutFilterDateRangeValue(dateRange);
    const isDateRangeValueSupported = (dateRangeValue?.conditions ?? []).every(
      (condition) =>
        !isDefined(getDashboardFilterConditionValueIssue(condition)),
    );

    if (!isDateRangeValueSupported) {
      showError(t`Use dates between the years 0001 and 9999.`);
      return;
    }

    showError(null);
    onChange(dateRangeValue);
  };

  const handleModeChange = (newMode: PageLayoutFilterValueMode) => {
    if (newMode === mode) {
      return;
    }

    showError(null);

    if (newMode === valueMode) {
      setChosenMode(null);
      return;
    }

    // Only the empty mode is a value in itself; the others apply once one is picked
    if (newMode !== 'NONE') {
      setChosenMode(newMode);
      return;
    }

    setChosenMode(null);
    onChange(null);
  };

  return (
    <StyledContainer>
      <Select
        dropdownId={`page-layout-filter-value-mode-${instanceId}`}
        label={label}
        description={
          mode === 'CUSTOM'
            ? t`This value can't be edited here. Pick another option to replace it.`
            : undefined
        }
        fullWidth
        value={mode}
        options={modeOptions}
        onChange={handleModeChange}
      />
      {mode === 'RELATIVE' && (
        <FormRelativeDatePicker
          key={pickersKey}
          defaultValue={
            valueMode === 'RELATIVE' ? relativeDateDisplayValue : undefined
          }
          onChange={handleRelativeDateChange}
        />
      )}
      {mode === 'DATE_RANGE' && (
        <StyledDateRangeRow key={pickersKey}>
          <FormDateFieldInput
            label={t`From`}
            defaultValue={startDate ?? undefined}
            onChange={(newStartDate) =>
              handleDateRangeChange({ startDate: newStartDate, endDate })
            }
          />
          <FormDateFieldInput
            label={t`To`}
            defaultValue={endDate ?? undefined}
            onChange={(newEndDate) =>
              handleDateRangeChange({ startDate, endDate: newEndDate })
            }
          />
        </StyledDateRangeRow>
      )}
      {isNonEmptyString(errorMessage) && (
        <StyledError>{errorMessage}</StyledError>
      )}
    </StyledContainer>
  );
};
