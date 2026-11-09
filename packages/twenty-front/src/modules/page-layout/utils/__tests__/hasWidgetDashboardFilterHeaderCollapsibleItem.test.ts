import { hasWidgetDashboardFilterHeaderCollapsibleItem } from '@/page-layout/utils/hasWidgetDashboardFilterHeaderCollapsibleItem';

const pill = (kind: 'IGNORED' | 'UNAVAILABLE' | 'OVERLAP') => ({
  pageLayoutFilterId: 'date-range',
  kind,
  text: kind,
  tooltip: kind,
});

describe('hasWidgetDashboardFilterHeaderCollapsibleItem', () => {
  it('should find nothing to collapse in an empty header', () => {
    expect(
      hasWidgetDashboardFilterHeaderCollapsibleItem({
        fieldLabels: [],
        pills: [],
      }),
    ).toBe(false);
  });

  it('should keep the unavailable-field status out of the collapsible items', () => {
    expect(
      hasWidgetDashboardFilterHeaderCollapsibleItem({
        fieldLabels: [],
        pills: [pill('UNAVAILABLE')],
      }),
    ).toBe(false);
  });

  it('should find a grey pill or an edit-mode label collapsible', () => {
    expect(
      hasWidgetDashboardFilterHeaderCollapsibleItem({
        fieldLabels: [],
        pills: [pill('UNAVAILABLE'), pill('OVERLAP')],
      }),
    ).toBe(true);
    expect(
      hasWidgetDashboardFilterHeaderCollapsibleItem({
        fieldLabels: [
          {
            pageLayoutFilterId: 'date-range',
            kind: 'APPLIED',
            text: 'Close date',
            fullText: 'Date range · Close date',
          },
        ],
        pills: [],
      }),
    ).toBe(true);
  });
});
