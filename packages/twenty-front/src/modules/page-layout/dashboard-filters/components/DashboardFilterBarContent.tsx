import { DashboardFilterDropdownButton } from '@/page-layout/dashboard-filters/components/DashboardFilterDropdownButton';
import { DashboardFilterUrlSyncEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterUrlSyncEffect';
import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { countDashboardFilterSlotBoundCharts } from '@/page-layout/dashboard-filters/utils/countDashboardFilterSlotBoundCharts';
import { getDashboardFilterRepresentativeBindingOrThrow } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRepresentativeBindingOrThrow';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledBar = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 32px;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

  @media print {
    display: none;
  }
`;

export const DashboardFilterBarContent = () => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const workspaceSurface = useWorkspaceSurface();

  const { slots, bindingsByWidgetId } = useDashboardFilterSlots();

  // Only the surface that owns the route mirrors values into the URL; a side panel dashboard keeps them in memory.
  const shouldSyncWithUrl = workspaceSurface.type === 'main';

  if (slots.length === 0) {
    return null;
  }

  return (
    <>
      {shouldSyncWithUrl && (
        <DashboardFilterUrlSyncEffect
          key={currentPageLayout.id}
          pageLayoutId={currentPageLayout.id}
          slots={slots}
        />
      )}
      <StyledBar>
        {slots.map((slot) => {
          const { boundChartCount, chartCount } =
            countDashboardFilterSlotBoundCharts({
              slotId: slot.id,
              bindingsByWidgetId,
            });

          return (
            <DashboardFilterDropdownButton
              key={slot.id}
              slot={slot}
              representativeBinding={getDashboardFilterRepresentativeBindingOrThrow(
                { slotId: slot.id, bindingsByWidgetId },
              )}
              boundChartCount={boundChartCount}
              chartCount={chartCount}
            />
          );
        })}
      </StyledBar>
    </>
  );
};
