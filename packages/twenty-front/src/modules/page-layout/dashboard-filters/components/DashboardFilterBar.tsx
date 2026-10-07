import { DashboardFilterChip } from '@/page-layout/dashboard-filters/components/DashboardFilterChip';
import { DashboardFilterUrlSyncEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterUrlSyncEffect';
import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { countDashboardFilterSlotWidgets } from '@/page-layout/dashboard-filters/utils/countDashboardFilterSlotWidgets';
import { getDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRepresentativeBinding';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

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
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const { slots, bindingsByWidgetId } = useDashboardFilterSlots();

  if (slots.length === 0) {
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

  return (
    <>
      <DashboardFilterUrlSyncEffect slots={slots} />
      {chips.length > 0 && (
        <StyledBar className="page-layout-tab-list-print-hidden">
          {chips.map(({ slot, representativeBinding, widgetCounts }) => (
            <DashboardFilterChip
              key={slot.id}
              slot={slot}
              representativeBinding={representativeBinding}
              widgetCounts={widgetCounts}
            />
          ))}
        </StyledBar>
      )}
    </>
  );
};
