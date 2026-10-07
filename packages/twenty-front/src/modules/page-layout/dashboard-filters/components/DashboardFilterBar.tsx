import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { DashboardFilterChip } from '@/page-layout/dashboard-filters/components/DashboardFilterChip';
import { DashboardFilterUrlSyncEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterUrlSyncEffect';
import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { useOpenDashboardFilterEditor } from '@/page-layout/dashboard-filters/hooks/useOpenDashboardFilterEditor';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { areDashboardFilterValuesAtDefaults } from '@/page-layout/dashboard-filters/utils/areDashboardFilterValuesAtDefaults';
import { computeDashboardFilterDefaultValues } from '@/page-layout/dashboard-filters/utils/computeDashboardFilterDefaultValues';
import { countDashboardFilterSlotWidgets } from '@/page-layout/dashboard-filters/utils/countDashboardFilterSlotWidgets';
import { getDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRepresentativeBinding';
import { getDashboardFilterSlotRelationTargetObjectMetadataId } from '@/page-layout/dashboard-filters/utils/getDashboardFilterSlotRelationTargetObjectMetadataId';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { PageLayoutType } from '~/generated-metadata/graphql';

const StyledBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 32px;
  overflow-x: auto;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export const DashboardFilterBar = () => {
  const { t } = useLingui();
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const { slots, bindingsByWidgetId, isUsingBuiltInSlots } =
    useDashboardFilterSlots();

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const [dashboardFilterValues, setDashboardFilterValues] =
    useAtomComponentState(dashboardFilterValuesComponentState);

  const { openDashboardFiltersEditor, openDashboardFilterSlotEditor } =
    useOpenDashboardFilterEditor(currentPageLayout.id);

  // In edit mode the bar stays even without slots so the editor entry point is reachable.
  const canEditDashboardFilters =
    isPageLayoutInEditMode &&
    currentPageLayout.type === PageLayoutType.DASHBOARD;

  if (slots.length === 0 && !canEditDashboardFilters) {
    return null;
  }

  const widgets = currentPageLayout.tabs.flatMap((tab) => tab.widgets);

  const canResetDashboardFilters = !areDashboardFilterValuesAtDefaults({
    slots,
    values: dashboardFilterValues,
  });

  // The URL follows the state through the sync effect, so restoring the defaults is a single state write.
  const handleResetClick = () => {
    setDashboardFilterValues(computeDashboardFilterDefaultValues(slots));
  };

  // A slot no widget binds has no field to edit through, so it gets no chip.
  const chips = slots.flatMap((slot) => {
    const representativeBinding = getDashboardFilterRepresentativeBinding({
      slotId: slot.id,
      bindingsByWidgetId,
      objectMetadataItems,
    });

    if (!isDefined(representativeBinding)) {
      return [];
    }

    const relationTargetObjectMetadataId =
      slot.filterType === 'RELATION'
        ? getDashboardFilterSlotRelationTargetObjectMetadataId({
            slotId: slot.id,
            bindingsByWidgetId,
            objectMetadataItems,
          })
        : undefined;

    return [
      {
        slot,
        representativeBinding,
        relationTargetObjectNameSingular: objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.id === relationTargetObjectMetadataId,
        )?.nameSingular,
        widgetCounts: countDashboardFilterSlotWidgets({
          slotId: slot.id,
          widgets,
          bindingsByWidgetId,
        }),
      },
    ];
  });

  // Built-ins are not on the draft, so their chips lead to the list where a custom filter can replace them.
  const handleEditSlot = (slot: DashboardFilterSlot) => {
    if (isUsingBuiltInSlots) {
      openDashboardFiltersEditor();
      return;
    }

    openDashboardFilterSlotEditor(slot);
  };

  return (
    <>
      {slots.length > 0 && (
        <DashboardFilterUrlSyncEffect
          key={currentPageLayout.id}
          slots={slots}
        />
      )}
      {(chips.length > 0 || canEditDashboardFilters) && (
        <StyledBar className="page-layout-tab-list-print-hidden">
          {chips.map(
            ({
              slot,
              representativeBinding,
              relationTargetObjectNameSingular,
              widgetCounts,
            }) => (
              <DashboardFilterChip
                key={slot.id}
                slot={slot}
                representativeBinding={representativeBinding}
                relationTargetObjectNameSingular={
                  relationTargetObjectNameSingular
                }
                widgetCounts={widgetCounts}
                onEdit={
                  canEditDashboardFilters
                    ? () => handleEditSlot(slot)
                    : undefined
                }
              />
            ),
          )}
          {canEditDashboardFilters && (
            <LightButton
              emphasis="subtle"
              onClick={openDashboardFiltersEditor}
              startIcon={<IconPlus />}
            >{t`Add filter`}</LightButton>
          )}
          {canResetDashboardFilters && (
            <LightButton
              emphasis="subtle"
              onClick={handleResetClick}
            >{t`Reset`}</LightButton>
          )}
        </StyledBar>
      )}
    </>
  );
};
