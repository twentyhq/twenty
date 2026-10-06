import { findDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/findDashboardFilterRepresentativeBinding';

const BINDINGS_BY_WIDGET_ID = {
  first: { slot: null },
  second: { slot: { fieldMetadataId: 'deleted-field' } },
  third: { slot: { fieldMetadataId: 'live-field' } },
};

describe('findDashboardFilterRepresentativeBinding', () => {
  it('returns the first binding some chart has for the slot', () => {
    expect(
      findDashboardFilterRepresentativeBinding({
        slotId: 'slot',
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toEqual({ fieldMetadataId: 'deleted-field' });
  });

  it('skips bindings the caller cannot use', () => {
    expect(
      findDashboardFilterRepresentativeBinding({
        slotId: 'slot',
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
        isBindingUsable: (binding) => binding.fieldMetadataId === 'live-field',
      }),
    ).toEqual({ fieldMetadataId: 'live-field' });
  });

  it('returns undefined when no chart binds the slot', () => {
    expect(
      findDashboardFilterRepresentativeBinding({
        slotId: 'other-slot',
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toBeUndefined();
  });
});
