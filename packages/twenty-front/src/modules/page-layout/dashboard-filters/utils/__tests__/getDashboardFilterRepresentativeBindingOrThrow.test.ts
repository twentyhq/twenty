import { getDashboardFilterRepresentativeBindingOrThrow } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRepresentativeBindingOrThrow';

const BINDINGS_BY_WIDGET_ID = {
  'chart-1': { date: null, owner: null },
  'chart-2': { date: { fieldMetadataId: 'chart-2-created-at' }, owner: null },
  'chart-3': { date: { fieldMetadataId: 'chart-3-created-at' }, owner: null },
};

describe('getDashboardFilterRepresentativeBindingOrThrow', () => {
  it('returns the first non-null binding of the slot', () => {
    expect(
      getDashboardFilterRepresentativeBindingOrThrow({
        slotId: 'date',
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toEqual({ fieldMetadataId: 'chart-2-created-at' });
  });

  it('throws for a slot no chart binds', () => {
    expect(() =>
      getDashboardFilterRepresentativeBindingOrThrow({
        slotId: 'owner',
        bindingsByWidgetId: BINDINGS_BY_WIDGET_ID,
      }),
    ).toThrow('owner');
  });
});
