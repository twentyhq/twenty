import { DATE_PICKER_DROPDOWN_CONTENT_WIDTH } from '@/object-record/object-filter-dropdown/constants/DatePickerDropdownContentWidth';
import { useGetRelativeDateFilterWithUserTimezone } from '@/object-record/record-filter/hooks/useGetRelativeDateFilterWithUserTimezone';
import { PageLayoutFilterDateRangeInput } from '@/page-layout/components/PageLayoutFilterDateRangeInput';
import { type PageLayoutFilterValueMode } from '@/page-layout/types/PageLayoutFilterValueMode';
import { getPageLayoutFilterDateRange } from '@/page-layout/utils/getPageLayoutFilterDateRange';
import { getPageLayoutFilterValueMode } from '@/page-layout/utils/getPageLayoutFilterValueMode';
import { stringifyPageLayoutFilterRelativeDateValue } from '@/page-layout/utils/stringifyPageLayoutFilterRelativeDateValue';
import { DatePicker } from '@/ui/input/components/internal/date/components/DatePicker';
import { DropdownMenuInnerSelect } from '@/ui/layout/dropdown/components/DropdownMenuInnerSelect';
import { stringifyRelativeDateFilterWithDetectedStartDay } from '@/views/view-filter-value/utils/stringifyRelativeDateFilterWithDetectedStartDay';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import {
  DASHBOARD_FILTER_RELATIVE_DATE_AMOUNT_MAX,
  DEFAULT_RELATIVE_DATE_FILTER_VALUE,
} from 'twenty-shared/constants';
import {
  isDefined,
  type RelativeDateFilter,
  relativeDateFilterStringifiedSchema,
  resolveRelativeDateFilterStringified,
} from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from '~/generated-metadata/graphql';

const StyledMessage = styled.div`
  padding: 0 ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
`;

type PageLayoutFilterValueInputProps = {
  label: string;
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
  // The picker keeps the typed amount, so a clamped amount remounts it on the stored value
  const [relativeDatePickerKey, setRelativeDatePickerKey] = useState(0);

  const valueMode = getPageLayoutFilterValueMode(value ?? null);
  const mode = chosenMode ?? valueMode;

  const storedRelativeDateFilter =
    relativeDateFilterStringifiedSchema.safeParse(value?.conditions[0]?.value);
  const relativeDateFilterToShow =
    valueMode === 'RELATIVE' && storedRelativeDateFilter.success
      ? storedRelativeDateFilter.data
      : DEFAULT_RELATIVE_DATE_FILTER_VALUE;

  // The calendar reads the editor's timezone and week start unless the value carries its own
  const relativeDate = resolveRelativeDateFilterStringified(
    stringifyRelativeDateFilterWithDetectedStartDay(
      isNonEmptyString(relativeDateFilterToShow.timezone)
        ? relativeDateFilterToShow
        : getRelativeDateFilterWithUserTimezone(relativeDateFilterToShow),
    ),
  );

  const modeOptions: { label: string; value: PageLayoutFilterValueMode }[] = [
    { label: emptyValueLabel, value: 'NONE' },
    { label: t`Relative date`, value: 'RELATIVE' },
    { label: t`Custom range`, value: 'CUSTOM_RANGE' },
    ...(valueMode === 'OTHER'
      ? [{ label: t`Other value`, value: 'OTHER' as const }]
      : []),
  ];

  const selectedModeOption =
    modeOptions.find((option) => option.value === mode) ?? modeOptions[0];

  const handleModeChange = (newMode: PageLayoutFilterValueMode) => {
    if (newMode === mode) {
      return;
    }

    setErrorMessage(null);

    if (newMode === valueMode) {
      setChosenMode(null);
      return;
    }

    if (newMode === 'NONE') {
      setChosenMode(null);
      onChange(null);
      return;
    }

    setChosenMode(newMode);

    // Like the record filter, a relative date applies its shown default at once; a range waits for a bound
    if (newMode === 'RELATIVE') {
      handleRelativeDateChange(DEFAULT_RELATIVE_DATE_FILTER_VALUE);
    }
  };

  const handleRelativeDateChange = (
    relativeDateFilter: RelativeDateFilter | null,
  ) => {
    if (!isDefined(relativeDateFilter)) {
      return;
    }

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

    setErrorMessage(
      isAmountTooLarge
        ? t`Amount must be ${DASHBOARD_FILTER_RELATIVE_DATE_AMOUNT_MAX} or less.`
        : null,
    );

    if (isAmountTooLarge) {
      setRelativeDatePickerKey((previousKey) => previousKey + 1);
    }
  };

  return (
    <>
      <DropdownMenuInnerSelect
        dropdownId={`page-layout-filter-value-mode-${instanceId}`}
        aria-label={label}
        selectedOption={selectedModeOption}
        options={modeOptions}
        onChange={(option) =>
          handleModeChange(
            modeOptions.find(({ value }) => value === option.value)?.value ??
              mode,
          )
        }
        widthInPixels={DATE_PICKER_DROPDOWN_CONTENT_WIDTH}
      />
      {mode !== 'NONE' && <Dropdown.Separator />}
      {mode === 'OTHER' && (
        <Field.Root render={<StyledMessage />}>
          <Field.Description>
            {t`This value can't be edited here. Pick another option to replace it.`}
          </Field.Description>
        </Field.Root>
      )}
      {mode === 'RELATIVE' && (
        <>
          <DatePicker
            key={relativeDatePickerKey}
            instanceId={`page-layout-filter-relative-date-${instanceId}`}
            isRelative
            relativeDate={relativeDate ?? undefined}
            plainDateString={null}
            onRelativeDateChange={handleRelativeDateChange}
            clearable={false}
          />
          {isNonEmptyString(errorMessage) && (
            <Field.Root render={<StyledMessage />}>
              <Field.Error match role="alert">
                {errorMessage}
              </Field.Error>
            </Field.Root>
          )}
        </>
      )}
      {mode === 'CUSTOM_RANGE' && (
        <PageLayoutFilterDateRangeInput
          dateRange={getPageLayoutFilterDateRange(
            valueMode === 'CUSTOM_RANGE' ? (value ?? null) : null,
          )}
          onChange={(dateRangeValue) => {
            setChosenMode('CUSTOM_RANGE');
            onChange(dateRangeValue);
          }}
        />
      )}
    </>
  );
};
