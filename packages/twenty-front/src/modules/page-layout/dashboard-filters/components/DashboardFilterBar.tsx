import { DashboardFilterChip } from '@/page-layout/dashboard-filters/components/DashboardFilterChip';
import { DashboardFilterUrlSyncEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterUrlSyncEffect';
import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { getDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRepresentativeBinding';
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
  const { slots, bindingsByWidgetId } = useDashboardFilterSlots();

  if (slots.length === 0) {
    return null;
  }

  // A slot no widget binds has no field to edit through, so it gets no chip.
  const chips = slots.flatMap((slot) => {
    const representativeBinding = getDashboardFilterRepresentativeBinding({
      slotId: slot.id,
      bindingsByWidgetId,
    });

    return isDefined(representativeBinding)
      ? [{ slot, representativeBinding }]
      : [];
  });

  return (
    <>
      <DashboardFilterUrlSyncEffect slots={slots} />
      {chips.length > 0 && (
        <StyledBar className="page-layout-tab-list-print-hidden">
          {chips.map(({ slot, representativeBinding }) => (
            <DashboardFilterChip
              key={slot.id}
              slot={slot}
              representativeBinding={representativeBinding}
            />
          ))}
        </StyledBar>
      )}
    </>
  );
};
