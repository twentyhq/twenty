import { DashboardFilterChip } from '@/page-layout/dashboard-filters/components/DashboardFilterChip';
import { DashboardFilterUrlSyncEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterUrlSyncEffect';
import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { useOpenDashboardFilterEditor } from '@/page-layout/dashboard-filters/hooks/useOpenDashboardFilterEditor';
import { countDashboardFilterSlotWidgets } from '@/page-layout/dashboard-filters/utils/countDashboardFilterSlotWidgets';
import { getDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRepresentativeBinding';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { FeatureFlagKey, PageLayoutType } from '~/generated-metadata/graphql';

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

  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  const { openDashboardFiltersEditor, openDashboardFilterSlotEditor } =
    useOpenDashboardFilterEditor(currentPageLayout.id);

  // In edit mode the bar stays even without slots so the editor entry point is reachable.
  const canEditDashboardFilters =
    isPageLayoutInEditMode &&
    isDashboardFiltersEnabled &&
    currentPageLayout.type === PageLayoutType.DASHBOARD;

  if (slots.length === 0 && !canEditDashboardFilters) {
    return null;
  }

  const widgets = currentPageLayout.tabs.flatMap((tab) => tab.widgets);

  // A slot no widget binds has no field to edit through, so it gets no chip.
  const chips = slots.flatMap((slot) => {
    const representativeBinding = getDashboardFilterRepresentativeBinding({
      slotId: slot.id,
      bindingsByWidgetId,
    });

    if (!isDefined(representativeBinding)) {
      return [];
    }

    return [
      {
        slot,
        representativeBinding,
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
      {slots.length > 0 && <DashboardFilterUrlSyncEffect slots={slots} />}
      {(chips.length > 0 || canEditDashboardFilters) && (
        <StyledBar className="page-layout-tab-list-print-hidden">
          {chips.map(({ slot, representativeBinding, widgetCounts }) => (
            <DashboardFilterChip
              key={slot.id}
              slot={slot}
              representativeBinding={representativeBinding}
              widgetCounts={widgetCounts}
              onEdit={
                canEditDashboardFilters ? () => handleEditSlot(slot) : undefined
              }
            />
          ))}
          {canEditDashboardFilters && (
            <LightButton
              emphasis="subtle"
              onClick={openDashboardFiltersEditor}
              startIcon={<IconPlus />}
            >{t`Add filter`}</LightButton>
          )}
        </StyledBar>
      )}
    </>
  );
};
