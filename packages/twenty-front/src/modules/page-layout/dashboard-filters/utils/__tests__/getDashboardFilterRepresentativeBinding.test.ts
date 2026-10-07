import { getDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/getDashboardFilterRepresentativeBinding';

describe('getDashboardFilterRepresentativeBinding', () => {
  it('returns the first non-null binding found across widgets', () => {
    const representativeBinding = getDashboardFilterRepresentativeBinding({
      slotId: 'date',
      bindingsByWidgetId: {
        'widget-1': { date: null },
        'widget-2': { owner: { fieldMetadataId: 'owner-field-id' } },
        'widget-3': { date: { fieldMetadataId: 'created-at-field-id' } },
        'widget-4': { date: { fieldMetadataId: 'other-field-id' } },
      },
    });

    expect(representativeBinding).toEqual({
      fieldMetadataId: 'created-at-field-id',
    });
  });

  it('returns undefined when no widget binds the slot', () => {
    const representativeBinding = getDashboardFilterRepresentativeBinding({
      slotId: 'date',
      bindingsByWidgetId: {
        'widget-1': { date: null },
        'widget-2': {},
      },
    });

    expect(representativeBinding).toBeUndefined();
  });
});
