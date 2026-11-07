import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { FormRelativeDatePicker } from '@/object-record/record-field/ui/form-types/components/FormRelativeDatePicker';
import { useGetRelativeDateFilterWithUserTimezone } from '@/object-record/record-filter/hooks/useGetRelativeDateFilterWithUserTimezone';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { removePageLayoutFilterFromDraft } from '@/page-layout/utils/removePageLayoutFilterFromDraft';
import { PAGE_LAYOUT_FILTER_RELATIVE_AMOUNT_MAX } from '@/side-panel/pages/page-layout/constants/PageLayoutFilterRelativeAmountMax';
import { buildPageLayoutFilterDateRangeValue } from '@/side-panel/pages/page-layout/utils/buildPageLayoutFilterDateRangeValue';
import { getPageLayoutFilterDateRange } from '@/side-panel/pages/page-layout/utils/getPageLayoutFilterDateRange';
import { isPageLayoutFilterDefaultValueSupported } from '@/side-panel/pages/page-layout/utils/isPageLayoutFilterDefaultValueSupported';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { stringifyRelativeDateFilterWithDetectedStartDay } from '@/views/view-filter-value/utils/stringifyRelativeDateFilterWithDetectedStartDay';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { DEFAULT_RELATIVE_DATE_FILTER_VALUE } from 'twenty-shared/constants';
import { isDefined, type RelativeDateFilter } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/icon';
import { Button, type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  type PageLayoutFilter,
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from '~/generated-metadata/graphql';

type DashboardFilterDefaultValueMode = 'NONE' | 'RELATIVE' | 'DATE_RANGE';

const StyledCard = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledLabelRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledError = styled.span`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledDateRangeRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr;
`;

type DashboardFilterSettingsCardProps = {
  pageLayoutId: string;
  pageLayoutFilter: PageLayoutFilter;
};

export const DashboardFilterSettingsCard = ({
  pageLayoutId,
  pageLayoutFilter,
}: DashboardFilterSettingsCardProps) => {
  const { t } = useLingui();

  const setPageLayoutDraft = useSetAtomComponentState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const { getRelativeDateFilterWithUserTimezone } =
    useGetRelativeDateFilterWithUserTimezone();

  const relativeCondition = pageLayoutFilter.defaultValue?.conditions.find(
    ({ operand }) => operand === ViewFilterOperand.IS_RELATIVE,
  );

  const [defaultValueMode, setDefaultValueMode] =
    useState<DashboardFilterDefaultValueMode>(
      isDefined(relativeCondition)
        ? 'RELATIVE'
        : isDefined(pageLayoutFilter.defaultValue)
          ? 'DATE_RANGE'
          : 'NONE',
    );

  const [isDefaultValueUnsupported, setIsDefaultValueUnsupported] =
    useState(false);

  const { startDate, endDate } = getPageLayoutFilterDateRange(
    pageLayoutFilter.defaultValue ?? null,
  );

  const defaultValueModeOptions: SelectOption<DashboardFilterDefaultValueMode>[] =
    [
      { label: t`No default`, value: 'NONE' },
      { label: t`Relative date`, value: 'RELATIVE' },
      { label: t`Date range`, value: 'DATE_RANGE' },
    ];

  const updatePageLayoutFilter = (
    pageLayoutFilterUpdate: Partial<PageLayoutFilter>,
  ) => {
    setPageLayoutDraft((pageLayoutDraft) => ({
      ...pageLayoutDraft,
      filters: (pageLayoutDraft.filters ?? []).map((filter) =>
        filter.id === pageLayoutFilter.id
          ? { ...filter, ...pageLayoutFilterUpdate }
          : filter,
      ),
    }));
  };

  const updateDefaultValue = (defaultValue: PageLayoutFilterValue | null) => {
    const isSupported = isPageLayoutFilterDefaultValueSupported(defaultValue);

    setIsDefaultValueUnsupported(!isSupported);

    if (isSupported) {
      updatePageLayoutFilter({ defaultValue });
    }
  };

  const handleLabelBlur = () => {
    if (!isNonEmptyString(pageLayoutFilter.label.trim())) {
      updatePageLayoutFilter({ label: t`Period` });
    }
  };

  const handleRelativeDateChange = (relativeDateFilter: RelativeDateFilter) => {
    updateDefaultValue({
      conditions: [
        {
          operand: ViewFilterOperand.IS_RELATIVE,
          value:
            stringifyRelativeDateFilterWithDetectedStartDay(relativeDateFilter),
        },
      ],
    });
  };

  const handleDefaultValueModeChange = (
    newDefaultValueMode: DashboardFilterDefaultValueMode,
  ) => {
    if (newDefaultValueMode === defaultValueMode) {
      return;
    }

    setDefaultValueMode(newDefaultValueMode);

    if (newDefaultValueMode === 'RELATIVE') {
      handleRelativeDateChange(
        getRelativeDateFilterWithUserTimezone(
          DEFAULT_RELATIVE_DATE_FILTER_VALUE,
        ),
      );
      return;
    }

    updateDefaultValue(null);
  };

  const handleDateRangeChange = (dateRange: {
    startDate: string | null;
    endDate: string | null;
  }) => {
    updateDefaultValue(buildPageLayoutFilterDateRangeValue(dateRange));
  };

  const handleRemove = () => {
    setPageLayoutDraft((pageLayoutDraft) =>
      removePageLayoutFilterFromDraft({
        pageLayoutDraft,
        pageLayoutFilterId: pageLayoutFilter.id,
      }),
    );
  };

  return (
    <StyledCard>
      <StyledLabelRow>
        <TextInput
          label={t`Label`}
          value={pageLayoutFilter.label}
          onChange={(label) => updatePageLayoutFilter({ label })}
          onBlur={handleLabelBlur}
          fullWidth
        />
        <Button
          variant="outline"
          startIcon={<IconTrash />}
          onClick={handleRemove}
          aria-label={t`Remove filter`}
        />
      </StyledLabelRow>
      <Select
        dropdownId={`dashboard-filter-default-value-${pageLayoutFilter.id}`}
        label={t`Default value`}
        fullWidth
        value={defaultValueMode}
        options={defaultValueModeOptions}
        onChange={handleDefaultValueModeChange}
      />
      {defaultValueMode === 'RELATIVE' && (
        <FormRelativeDatePicker
          defaultValue={relativeCondition?.value}
          onChange={handleRelativeDateChange}
        />
      )}
      {defaultValueMode === 'DATE_RANGE' && (
        <StyledDateRangeRow>
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
      {isDefaultValueUnsupported && (
        <StyledError>
          {defaultValueMode === 'RELATIVE'
            ? t`Use an amount of ${PAGE_LAYOUT_FILTER_RELATIVE_AMOUNT_MAX} or less.`
            : t`Use dates between the years 0001 and 9999.`}
        </StyledError>
      )}
    </StyledCard>
  );
};
