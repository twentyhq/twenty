import { buildDashboardFilterSlotFromCandidateDimension } from '@/page-layout/dashboard-filters/utils/buildDashboardFilterSlotFromCandidateDimension';

describe('buildDashboardFilterSlotFromCandidateDimension', () => {
  it('creates a slot with a fresh id and the proposed bindings', () => {
    const dimension = {
      id: 'field:createdAt:DATE_TIME',
      label: 'Creation date',
      filterType: 'DATE_TIME' as const,
      proposedBindingsByWidgetId: {
        companies: { fieldMetadataId: 'company-created-at' },
        people: null,
      },
      boundChartCount: 1,
      chartCount: 2,
    };

    const first = buildDashboardFilterSlotFromCandidateDimension(dimension);
    const second = buildDashboardFilterSlotFromCandidateDimension(dimension);

    expect(first.slot).toEqual({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      label: 'Creation date',
      filterType: 'DATE_TIME',
    });
    expect(first.slot.id).not.toBe(second.slot.id);
    expect(first.bindingsByWidgetId).toEqual(
      dimension.proposedBindingsByWidgetId,
    );
    expect(first.bindingsByWidgetId).not.toBe(
      dimension.proposedBindingsByWidgetId,
    );
  });
});
