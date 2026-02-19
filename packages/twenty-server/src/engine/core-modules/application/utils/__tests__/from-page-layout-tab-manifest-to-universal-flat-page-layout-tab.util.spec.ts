import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { fromPageLayoutTabManifestToUniversalFlatPageLayoutTab } from 'src/engine/core-modules/application/utils/from-page-layout-tab-manifest-to-universal-flat-page-layout-tab.util';

describe('fromPageLayoutTabManifestToUniversalFlatPageLayoutTab', () => {
  const now = '2026-01-01T00:00:00.000Z';
  const applicationUniversalIdentifier = 'app-uuid-1';
  const pageLayoutUniversalIdentifier = 'pl-uuid-1';

  it('should convert a minimal page layout tab manifest', () => {
    const result = fromPageLayoutTabManifestToUniversalFlatPageLayoutTab({
      pageLayoutTabManifest: {
        universalIdentifier: 'tab-uuid-1',
        title: 'Overview',
        position: 0,
      },
      pageLayoutUniversalIdentifier,
      applicationUniversalIdentifier,
      now,
    });

    expect(result.universalIdentifier).toBe('tab-uuid-1');
    expect(result.applicationUniversalIdentifier).toBe(
      applicationUniversalIdentifier,
    );
    expect(result.title).toBe('Overview');
    expect(result.position).toBe(0);
    expect(result.pageLayoutUniversalIdentifier).toBe(
      pageLayoutUniversalIdentifier,
    );
    expect(result.icon).toBeNull();
    expect(result.layoutMode).toBe(PageLayoutTabLayoutMode.GRID);
    expect(result.widgetUniversalIdentifiers).toEqual([]);
  });

  it('should convert a fully specified page layout tab manifest', () => {
    const result = fromPageLayoutTabManifestToUniversalFlatPageLayoutTab({
      pageLayoutTabManifest: {
        universalIdentifier: 'tab-uuid-2',
        title: 'Details',
        position: 1,
        icon: 'IconLayout',
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      },
      pageLayoutUniversalIdentifier,
      applicationUniversalIdentifier,
      now,
    });

    expect(result.title).toBe('Details');
    expect(result.position).toBe(1);
    expect(result.icon).toBe('IconLayout');
    expect(result.layoutMode).toBe(PageLayoutTabLayoutMode.VERTICAL_LIST);
  });
});
