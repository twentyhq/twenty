import { DashboardFilterChip } from '@/page-layout/dashboard-filters/components/DashboardFilterChip';
import { DashboardFilterUrlSyncEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterUrlSyncEffect';
import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { countDashboardFilterSlotBoundWidgets } from '@/page-layout/dashboard-filters/utils/countDashboardFilterSlotBoundWidgets';
import { getDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRepresentativeBinding';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
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
          const representativeBinding = getDashboardFilterRepresentativeBinding(
            { slotId: slot.id, bindingsByWidgetId },
          );

          // A slot nobody binds has no field to borrow an input from, so it stays hidden.
          if (!isDefined(representativeBinding)) {
            return null;
          }

          const { boundWidgetCount, totalWidgetCount } =
            countDashboardFilterSlotBoundWidgets({
              slotId: slot.id,
              bindingsByWidgetId,
            });

          return (
            <DashboardFilterChip
              key={slot.id}
              slot={slot}
              representativeBinding={representativeBinding}
              boundWidgetCount={boundWidgetCount}
              totalWidgetCount={totalWidgetCount}
            />
          );
        })}
      </StyledBar>
    </>
  );
};
