import { FORM_DATE_FIELD_PICKER_CLICK_OUTSIDE_ID } from '@/object-record/record-field/ui/form-types/constants/FormDateFieldPickerClickOutsideId';
import { DashboardFilterValueInput } from '@/page-layout/components/DashboardFilterValueInput';
import { useDashboardFilterValues } from '@/page-layout/hooks/useDashboardFilterValues';
import { useGetPageLayoutFilterValueLabel } from '@/page-layout/hooks/useGetPageLayoutFilterValueLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownButton } from '@/ui/layout/dropdown/components/DropdownButton';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLingui } from '@lingui/react/macro';
import { type PageLayoutFilterValue } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { IconChevronDown, IconFilter, IconRefreshDot } from 'twenty-ui/icon';

type DashboardFilterDropdownProps = {
  pageLayoutFilterId: string;
  label: string;
};

export const DashboardFilterDropdown = ({
  pageLayoutFilterId,
  label,
}: DashboardFilterDropdownProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const { getValueLabel } = useGetPageLayoutFilterValueLabel();

  const {
    dashboardFilterValueById,
    urlValueByPageLayoutFilterId,
    setDashboardFilterValue,
  } = useDashboardFilterValues();

  const dropdownId = `dashboard-filter-${pageLayoutFilterId}`;
  const value = dashboardFilterValueById[pageLayoutFilterId] ?? null;
  const valueLabel = getValueLabel(value);
  const isOverridingDefault = isDefined(
    urlValueByPageLayoutFilterId[pageLayoutFilterId],
  );

  // An empty value is stored, not removed, so it overrides the layout default
  const handleChange = (newValue: PageLayoutFilterValue | null) => {
    setDashboardFilterValue({
      pageLayoutFilterId,
      value: newValue ?? { conditions: [] },
    });
  };

  const handleResetToDefault = () => {
    closeDropdown(dropdownId);
    setDashboardFilterValue({ pageLayoutFilterId, value: null });
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      dropdownOffset={{ y: 4 }}
      excludedClickOutsideIds={[FORM_DATE_FIELD_PICKER_CLICK_OUTSIDE_ID]}
      clickableComponent={
        <DropdownButton
          startIcon={<IconFilter />}
          endIcon={<IconChevronDown />}
        >
          {t`${label}: ${valueLabel}`}
        </DropdownButton>
      }
      dropdownComponents={
        <LegacyDropdownContent
          widthInPixels={GenericDropdownContentWidth.ExtraLarge}
        >
          <DashboardFilterValueInput value={value} onChange={handleChange} />
          {isOverridingDefault && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItemsContainer scrollable={false}>
                <ListItemButton
                  startIcon={<IconRefreshDot />}
                  onClick={handleResetToDefault}
                >{t`Reset to default`}</ListItemButton>
              </DropdownMenuItemsContainer>
            </>
          )}
        </LegacyDropdownContent>
      }
    />
  );
};
