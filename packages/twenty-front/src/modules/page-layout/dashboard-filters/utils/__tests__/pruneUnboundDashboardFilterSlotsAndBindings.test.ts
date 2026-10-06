import { pruneUnboundDashboardFilterSlotsAndBindings } from '@/page-layout/dashboard-filters/utils/pruneUnboundDashboardFilterSlotsAndBindings';
import { type DashboardFilterSlot } from 'twenty-shared/types';

const BOUND_SLOT: DashboardFilterSlot = {
  id: 'bound',
  label: 'Bound',
  filterType: 'TEXT',
};
const UNBOUND_SLOT: DashboardFilterSlot = {
  id: 'unbound',
  label: 'Unbound',
  filterType: 'TEXT',
};

describe('pruneUnboundDashboardFilterSlotsAndBindings', () => {
  it('keeps slots at least one chart binds and drops the others from every chart', () => {
    expect(
      pruneUnboundDashboardFilterSlotsAndBindings({
        slots: [BOUND_SLOT, UNBOUND_SLOT],
        candidateBindingsByWidgetId: {
          companies: {
            bound: { fieldMetadataId: 'company-name' },
            unbound: null,
          },
          people: { bound: null, unbound: null },
        },
      }),
    ).toEqual({
      slotDefinitions: [BOUND_SLOT],
      bindingsByWidgetId: {
        companies: { bound: { fieldMetadataId: 'company-name' } },
        people: { bound: null },
      },
    });
  });

  it('keeps every chart entry, even empty, so chart counts stay right', () => {
    expect(
      pruneUnboundDashboardFilterSlotsAndBindings({
        slots: [UNBOUND_SLOT],
        candidateBindingsByWidgetId: { companies: { unbound: null } },
      }),
    ).toEqual({ slotDefinitions: [], bindingsByWidgetId: { companies: {} } });
  });
});
