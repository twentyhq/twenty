import { getDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRepresentativeBinding';

describe('getDashboardFilterRepresentativeBinding', () => {
  it('returns the first non-null binding of the slot', () => {
    const representativeBinding = getDashboardFilterRepresentativeBinding({
      slotId: 'date',
      bindingsByWidgetId: {
        'widget-without-date': { date: null },
        'widget-with-date': { date: { fieldMetadataId: 'created-at-id' } },
        'other-widget-with-date': {
          date: { fieldMetadataId: 'other-created-at-id' },
        },
      },
    });

    expect(representativeBinding).toEqual({ fieldMetadataId: 'created-at-id' });
  });

  it('returns undefined when no widget binds the slot', () => {
    const representativeBinding = getDashboardFilterRepresentativeBinding({
      slotId: 'date',
      bindingsByWidgetId: {
        'widget-without-date': { date: null },
        'widget-with-other-slot': { owner: { fieldMetadataId: 'owner-id' } },
      },
    });

    expect(representativeBinding).toBeUndefined();
  });
});
