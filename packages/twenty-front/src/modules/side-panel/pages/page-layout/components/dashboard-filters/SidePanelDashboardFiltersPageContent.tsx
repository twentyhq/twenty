import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { useAddDashboardFilterSlot } from '@/page-layout/dashboard-filters/hooks/useAddDashboardFilterSlot';
import { useDashboardFilterSlotsForPageLayout } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlotsForPageLayout';
import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import { countDashboardFilterSlotWidgets } from '@/page-layout/dashboard-filters/utils/countDashboardFilterSlotWidgets';
import { getDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRepresentativeBinding';
import { getDashboardFilterTypeLabel } from '@/page-layout/dashboard-filters/utils/getDashboardFilterTypeLabel';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingDashboardFilterSlotIdComponentState } from '@/page-layout/states/pageLayoutEditingDashboardFilterSlotIdComponentState';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { DashboardFilterCandidateDimensionsDropdownContent } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFilterCandidateDimensionsDropdownContent';
import { DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/DashboardFilterSettingsSelectableItemIds';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter, IconPlus, useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

type SidePanelDashboardFiltersPageContentProps = {
  pageLayoutId: string;
};

export const SidePanelDashboardFiltersPageContent = ({
  pageLayoutId,
}: SidePanelDashboardFiltersPageContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { slots, bindingsByWidgetId, isUsingBuiltInSlots } =
    useDashboardFilterSlotsForPageLayout(pageLayoutId);

  const setPageLayoutEditingDashboardFilterSlotId = useSetAtomComponentState(
    pageLayoutEditingDashboardFilterSlotIdComponentState,
    pageLayoutId,
  );

  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();
  const { addDashboardFilterSlot } = useAddDashboardFilterSlot(pageLayoutId);

  const widgets = pageLayoutDraft.tabs.flatMap((tab) => tab.widgets);

  const openSlotDetail = (slot: DashboardFilterSlot) => {
    setPageLayoutEditingDashboardFilterSlotId(slot.id);
    navigateToSidePanelSubPage(
      SidePanelSubPages.PageLayoutDashboardFilterDetail,
      slot.label,
    );
  };

  const handleDimensionSelect = (
    dimension: DashboardFilterCandidateDimension,
  ) => {
    openSlotDetail(addDashboardFilterSlot(dimension));
  };

  const selectableItemIds = [
    ...(isUsingBuiltInSlots ? [] : slots.map((slot) => slot.id)),
    DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.ADD_FILTER,
  ];

  return (
    <SidePanelList selectableItemIds={selectableItemIds}>
      <SidePanelGroup heading={t`Filters`}>
        {isUsingBuiltInSlots && (
          <StyledHint>{t`Built-in filters. Add a filter to customize.`}</StyledHint>
        )}
        {slots.map((slot) => {
          const representativeBinding = getDashboardFilterRepresentativeBinding(
            { slotId: slot.id, bindingsByWidgetId },
          );

          const { fieldMetadataItem } = isDefined(representativeBinding)
            ? getFieldMetadataItemById({
                fieldMetadataId: representativeBinding.fieldMetadataId,
                objectMetadataItems,
              })
            : { fieldMetadataItem: undefined };

          const { boundWidgetCount, graphWidgetCount } =
            countDashboardFilterSlotWidgets({
              slotId: slot.id,
              widgets,
              bindingsByWidgetId,
            });

          const filterTypeLabel = getDashboardFilterTypeLabel(slot.filterType);

          const description = plural(graphWidgetCount, {
            one: `${filterTypeLabel} · ${boundWidgetCount} of # widget`,
            other: `${filterTypeLabel} · ${boundWidgetCount} of # widgets`,
          });

          return (
            <SelectableListItem
              key={slot.id}
              itemId={slot.id}
              onEnter={
                isUsingBuiltInSlots ? undefined : () => openSlotDetail(slot)
              }
            >
              <CommandMenuItem
                id={slot.id}
                label={slot.label}
                Icon={
                  isDefined(fieldMetadataItem)
                    ? getIcon(fieldMetadataItem.icon)
                    : IconFilter
                }
                description={description}
                contextualTextPosition="right"
                hasSubMenu={!isUsingBuiltInSlots}
                disabled={isUsingBuiltInSlots}
                onClick={
                  isUsingBuiltInSlots ? undefined : () => openSlotDetail(slot)
                }
              />
            </SelectableListItem>
          );
        })}
        <SelectableListItem
          itemId={DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.ADD_FILTER}
        >
          <CommandMenuItemDropdown
            id={DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.ADD_FILTER}
            dropdownId={
              DASHBOARD_FILTER_SETTINGS_SELECTABLE_ITEM_IDS.ADD_FILTER
            }
            label={t`Add filter`}
            Icon={IconPlus}
            dropdownPlacement="bottom-end"
            dropdownComponents={
              <LegacyDropdownContent>
                <DashboardFilterCandidateDimensionsDropdownContent
                  pageLayoutId={pageLayoutId}
                  onDimensionSelect={handleDimensionSelect}
                />
              </LegacyDropdownContent>
            }
          />
        </SelectableListItem>
      </SidePanelGroup>
    </SidePanelList>
  );
};
