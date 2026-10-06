import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { useDashboardFilterEditor } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterEditor';
import { useDashboardFilterEditorActions } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterEditorActions';
import { dashboardFilterEditingSlotIdComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterEditingSlotIdComponentState';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { DashboardFilterAddDropdownContent } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFilterAddDropdownContent';
import { DashboardFilterSlotRow } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFilterSlotRow';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconPlus, IconRestore } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const ADD_DASHBOARD_FILTER_ITEM_ID = 'add-dashboard-filter';
const RESTORE_BUILT_IN_DASHBOARD_FILTERS_ITEM_ID =
  'restore-built-in-dashboard-filters';

const StyledHint = styled.p`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]};
`;

type DashboardFiltersSettingsContentProps = {
  pageLayoutId: string;
};

export const DashboardFiltersSettingsContent = ({
  pageLayoutId,
}: DashboardFiltersSettingsContentProps) => {
  const { slots, isUsingBuiltInFilters, bindingsByWidgetId } =
    useDashboardFilterEditor(pageLayoutId);

  const { removeSlot, restoreBuiltInFilters } =
    useDashboardFilterEditorActions(pageLayoutId);

  const setDashboardFilterEditingSlotId = useSetAtomComponentState(
    dashboardFilterEditingSlotIdComponentState,
    pageLayoutId,
  );

  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  const openSlotDetail = (slotId: string) => {
    setDashboardFilterEditingSlotId(slotId);
    navigateToSidePanelSubPage(
      SidePanelSubPages.PageLayoutDashboardFilterDetail,
    );
  };

  const canRestoreBuiltInFilters = !isUsingBuiltInFilters && slots.length === 0;

  const selectableItemIds = [
    ...slots.map((slot) => slot.id),
    ADD_DASHBOARD_FILTER_ITEM_ID,
    ...(canRestoreBuiltInFilters
      ? [RESTORE_BUILT_IN_DASHBOARD_FILTERS_ITEM_ID]
      : []),
  ];

  return (
    <SidePanelList selectableItemIds={selectableItemIds}>
      {slots.map((slot) => (
        <DashboardFilterSlotRow
          key={slot.id}
          slot={slot}
          bindingsByWidgetId={bindingsByWidgetId}
          onClick={
            isUsingBuiltInFilters ? undefined : () => openSlotDetail(slot.id)
          }
          onRemove={
            isUsingBuiltInFilters ? undefined : () => removeSlot(slot.id)
          }
        />
      ))}
      {isUsingBuiltInFilters && (
        <StyledHint>
          {t`Built-in filters apply to every chart with a matching field. Adding a filter turns them into custom filters you can edit.`}
        </StyledHint>
      )}
      <SelectableListItem itemId={ADD_DASHBOARD_FILTER_ITEM_ID}>
        <CommandMenuItemDropdown
          id={ADD_DASHBOARD_FILTER_ITEM_ID}
          dropdownId={ADD_DASHBOARD_FILTER_ITEM_ID}
          label={t`Add filter`}
          Icon={IconPlus}
          dropdownPlacement="bottom-end"
          dropdownOffset={{ y: 4 }}
          dropdownComponents={
            <LegacyDropdownContent
              widthInPixels={GenericDropdownContentWidth.ExtraLarge}
            >
              <DashboardFilterAddDropdownContent
                pageLayoutId={pageLayoutId}
                onDimensionAdded={openSlotDetail}
              />
            </LegacyDropdownContent>
          }
        />
      </SelectableListItem>
      {canRestoreBuiltInFilters && (
        <SelectableListItem
          itemId={RESTORE_BUILT_IN_DASHBOARD_FILTERS_ITEM_ID}
          onEnter={restoreBuiltInFilters}
        >
          <CommandMenuItem
            id={RESTORE_BUILT_IN_DASHBOARD_FILTERS_ITEM_ID}
            label={t`Restore built-in filters`}
            Icon={IconRestore}
            onClick={restoreBuiltInFilters}
          />
        </SelectableListItem>
      )}
    </SidePanelList>
  );
};
