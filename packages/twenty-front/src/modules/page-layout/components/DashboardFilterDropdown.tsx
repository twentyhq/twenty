import { FORM_DATE_FIELD_PICKER_CLICK_OUTSIDE_ID } from '@/object-record/record-field/ui/form-types/constants/FormDateFieldPickerClickOutsideId';
import { PageLayoutFilterValueInput } from '@/page-layout/components/PageLayoutFilterValueInput';
import { useDashboardFilters } from '@/page-layout/hooks/useDashboardFilters';
import { useGetPageLayoutFilterValueLabel } from '@/page-layout/hooks/useGetPageLayoutFilterValueLabel';
import { useSetDashboardFilterValue } from '@/page-layout/hooks/useSetDashboardFilterValue';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';
import {
  Dropdown,
  type DropdownDismissEvent,
} from 'twenty-ui/components/navigation';
import { IconChevronDown, IconFilter, IconRefreshDot } from 'twenty-ui/icon';
import { type PageLayoutFilterValue } from '~/generated-metadata/graphql';

type DashboardFilterDropdownProps = {
  pageLayoutFilterId: string;
  label: string;
};

export const DashboardFilterDropdown = ({
  pageLayoutFilterId,
  label,
}: DashboardFilterDropdownProps) => {
  const { t } = useLingui();
  const dashboardFilters = useDashboardFilters();
  const { setDashboardFilterValue } = useSetDashboardFilterValue();
  const { getValueLabel } = useGetPageLayoutFilterValueLabel();

  const value =
    dashboardFilters?.valueByPageLayoutFilterId[pageLayoutFilterId] ?? null;
  const valueLabel = getValueLabel(value);
  const isOverridingDefault = isDefined(
    dashboardFilters?.urlValueByPageLayoutFilterId[pageLayoutFilterId],
  );

  const handleChange = (newValue: PageLayoutFilterValue | null) =>
    setDashboardFilterValue({
      pageLayoutFilterId,
      value: newValue ?? { conditions: [] },
    });

  const handleResetToDefault = () =>
    setDashboardFilterValue({ pageLayoutFilterId, value: null });

  // The date picker opens in its own portal, outside the dropdown content
  const handleInteractOutside = (event: DropdownDismissEvent) => {
    if (
      isDefined(
        event.target?.closest(
          `[data-click-outside-id="${FORM_DATE_FIELD_PICKER_CLICK_OUTSIDE_ID}"]`,
        ),
      )
    ) {
      event.preventDefault();
    }
  };

  return (
    <DropdownRoot
      dropdownId={`dashboard-filter-${pageLayoutFilterId}`}
      type="panel"
      onInteractOutside={handleInteractOutside}
    >
      <Dropdown.Trigger
        render={
          <LightButton startIcon={<IconFilter />} endIcon={<IconChevronDown />}>
            {t`${label}: ${valueLabel}`}
          </LightButton>
        }
      />
      <DropdownContent
        align="end"
        width={GenericDropdownContentWidth.ExtraLarge}
        aria-label={label}
      >
        <Dropdown.Section>
          <PageLayoutFilterValueInput
            emptyValueLabel={t`All time`}
            value={value}
            onChange={handleChange}
          />
        </Dropdown.Section>
        {isOverridingDefault && (
          <>
            <Dropdown.Separator />
            <Dropdown.Section>
              <Dropdown.ActionItem
                startIcon={<IconRefreshDot />}
                onClick={handleResetToDefault}
              >{t`Reset to default`}</Dropdown.ActionItem>
            </Dropdown.Section>
          </>
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
