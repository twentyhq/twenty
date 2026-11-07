import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { FormRelativeDatePicker } from '@/object-record/record-field/ui/form-types/components/FormRelativeDatePicker';
import { PAGE_LAYOUT_FILTER_RELATIVE_AMOUNT_MAX } from '@/side-panel/pages/page-layout/constants/PageLayoutFilterRelativeAmountMax';
import { buildPageLayoutFilterDateRangeValue } from '@/side-panel/pages/page-layout/utils/buildPageLayoutFilterDateRangeValue';
import { getPageLayoutFilterDateRange } from '@/side-panel/pages/page-layout/utils/getPageLayoutFilterDateRange';
import { isPageLayoutFilterDefaultValueSupported } from '@/side-panel/pages/page-layout/utils/isPageLayoutFilterDefaultValueSupported';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { DEFAULT_RELATIVE_DATE_FILTER_VALUE } from 'twenty-shared/constants';
import {
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  type RelativeDateFilter,
  stringifyRelativeDateFilter,
} from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

type DashboardFilterValueMode = 'NONE' | 'RELATIVE' | 'DATE_RANGE';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
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

type DashboardFilterValueInputProps = {
  value: PageLayoutFilterValue | null;
  onChange: (value: PageLayoutFilterValue | null) => void;
};

export const DashboardFilterValueInput = ({
  value,
  onChange,
}: DashboardFilterValueInputProps) => {
  const { t } = useLingui();
  const modeDropdownId = useId();

  const relativeCondition = value?.conditions.find(
    ({ operand }) => operand === ViewFilterOperand.IS_RELATIVE,
  );

  // Kept in state: a date range without dates yet has no value to derive it from
  const [mode, setMode] = useState<DashboardFilterValueMode>(
    isDefined(relativeCondition)
      ? 'RELATIVE'
      : isDefined(value)
        ? 'DATE_RANGE'
        : 'NONE',
  );

  const [isValueUnsupported, setIsValueUnsupported] = useState(false);

  const { startDate, endDate } = getPageLayoutFilterDateRange(value);

  const modeOptions: SelectOption<DashboardFilterValueMode>[] = [
    { label: t`All time`, value: 'NONE' },
    { label: t`Relative date`, value: 'RELATIVE' },
    { label: t`Date range`, value: 'DATE_RANGE' },
  ];

  const updateValue = (newValue: PageLayoutFilterValue | null) => {
    const isSupported = isPageLayoutFilterDefaultValueSupported(newValue);

    setIsValueUnsupported(!isSupported);

    if (isSupported) {
      onChange(newValue);
    }
  };

  // The viewer's own time zone and week start apply when the value is resolved
  const handleRelativeDateChange = ({
    direction,
    amount,
    unit,
  }: RelativeDateFilter) => {
    updateValue({
      conditions: [
        {
          operand: ViewFilterOperand.IS_RELATIVE,
          value: stringifyRelativeDateFilter({ direction, amount, unit }),
        },
      ],
    });
  };

  const handleModeChange = (newMode: DashboardFilterValueMode) => {
    if (newMode === mode) {
      return;
    }

    setMode(newMode);

    if (newMode === 'RELATIVE') {
      handleRelativeDateChange(DEFAULT_RELATIVE_DATE_FILTER_VALUE);
      return;
    }

    updateValue(null);
  };

  const handleDateRangeChange = (
    dateRangeUpdate: Partial<
      Parameters<typeof buildPageLayoutFilterDateRangeValue>[0]
    >,
  ) =>
    updateValue(
      buildPageLayoutFilterDateRangeValue({
        startDate,
        endDate,
        ...dateRangeUpdate,
      }),
    );

  return (
    <StyledContainer>
      <Select
        dropdownId={modeDropdownId}
        fullWidth
        value={mode}
        options={modeOptions}
        onChange={handleModeChange}
      />
      {mode === 'RELATIVE' && (
        <FormRelativeDatePicker
          defaultValue={relativeCondition?.value}
          onChange={handleRelativeDateChange}
        />
      )}
      {mode === 'DATE_RANGE' && (
        <StyledDateRangeRow>
          <FormDateFieldInput
            label={t`From`}
            defaultValue={startDate ?? undefined}
            onChange={(newStartDate) =>
              handleDateRangeChange({ startDate: newStartDate })
            }
          />
          <FormDateFieldInput
            label={t`To`}
            defaultValue={endDate ?? undefined}
            onChange={(newEndDate) =>
              handleDateRangeChange({ endDate: newEndDate })
            }
          />
        </StyledDateRangeRow>
      )}
      {isValueUnsupported && (
        <StyledError>
          {mode === 'RELATIVE'
            ? t`Use an amount of ${PAGE_LAYOUT_FILTER_RELATIVE_AMOUNT_MAX} or less.`
            : t`Use dates between the years 0001 and 9999.`}
        </StyledError>
      )}
    </StyledContainer>
  );
};
