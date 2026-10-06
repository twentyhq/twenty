import { groupDashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/utils/groupDashboardFilterBindingsByWidgetId';

describe('groupDashboardFilterBindingsByWidgetId', () => {
  it('regroups one binding map per slot into one binding map per widget', () => {
    expect(
      groupDashboardFilterBindingsByWidgetId({
        date: {
          'chart-1': { fieldMetadataId: 'chart-1-created-at' },
          'chart-2': { fieldMetadataId: 'chart-2-created-at' },
        },
        owner: {
          'chart-1': { fieldMetadataId: 'chart-1-owner' },
          'chart-2': null,
        },
      }),
    ).toEqual({
      'chart-1': {
        date: { fieldMetadataId: 'chart-1-created-at' },
        owner: { fieldMetadataId: 'chart-1-owner' },
      },
      'chart-2': {
        date: { fieldMetadataId: 'chart-2-created-at' },
        owner: null,
      },
    });
  });

  it('keeps a widget known to only some slots', () => {
    expect(
      groupDashboardFilterBindingsByWidgetId({
        date: { 'chart-1': null },
        owner: {},
      }),
    ).toEqual({ 'chart-1': { date: null } });
  });

  it('returns an empty map when there are no slots', () => {
    expect(groupDashboardFilterBindingsByWidgetId({})).toEqual({});
  });
});
