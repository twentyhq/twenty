import { DashboardFilterChip } from '@/page-layout/dashboard-filters/components/DashboardFilterChip';
import { DashboardFilterUrlSyncEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterUrlSyncEffect';
import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { getDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRepresentativeBinding';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
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
  const pageLayoutInstanceId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
  );

  const { slots, bindingsByWidgetId } = useDashboardFilterSlots();

  if (slots.length === 0) {
    return null;
  }

  return (
    <>
      {/* Keyed so a navigation to another dashboard re-reads that dashboard's URL instead of overwriting it. */}
      <DashboardFilterUrlSyncEffect key={pageLayoutInstanceId} slots={slots} />
      <StyledBar>
        {slots.map((slot) => {
          const representativeBinding = getDashboardFilterRepresentativeBinding(
            { slotId: slot.id, bindingsByWidgetId },
          );

          // A slot nobody binds has no field to borrow an input from, so it stays hidden.
          if (!isDefined(representativeBinding)) {
            return null;
          }

          return (
            <DashboardFilterChip
              key={slot.id}
              slot={slot}
              representativeBinding={representativeBinding}
            />
          );
        })}
      </StyledBar>
    </>
  );
};
