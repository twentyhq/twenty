import {
  PageLayoutFilterType,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { fromPageLayoutManifestToUniversalFlatPageLayout } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-manifest-to-universal-flat-page-layout.util';

describe('fromPageLayoutManifestToUniversalFlatPageLayout', () => {
  const now = '2026-01-01T00:00:00.000Z';
  const applicationUniversalIdentifier = 'app-uuid-1';

  it('should convert a standalone page layout manifest', () => {
    const result = fromPageLayoutManifestToUniversalFlatPageLayout({
      pageLayoutManifest: {
        universalIdentifier: 'pl-uuid-1',
        name: 'My Page Layout',
        type: PageLayoutType.STANDALONE_PAGE,
      },
      applicationUniversalIdentifier,
      now,
    });

    expect(result.universalIdentifier).toBe('pl-uuid-1');
    expect(result.applicationUniversalIdentifier).toBe(
      applicationUniversalIdentifier,
    );
    expect(result.name).toBe('My Page Layout');
    expect(result.type).toBe(PageLayoutType.STANDALONE_PAGE);
    expect(result.objectMetadataUniversalIdentifier).toBeNull();
    expect(
      result.defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
    ).toBeNull();
    expect(result.tabUniversalIdentifiers).toEqual([]);
    expect(result.isFirstTabPinned).toBe(true);
    expect(result.filters).toBeNull();
  });

  it('should convert a record page layout manifest', () => {
    const result = fromPageLayoutManifestToUniversalFlatPageLayout({
      pageLayoutManifest: {
        universalIdentifier: 'pl-uuid-2',
        name: 'Record Layout',
        type: PageLayoutType.RECORD_PAGE,
        objectUniversalIdentifier: 'obj-uuid-1',
      },
      applicationUniversalIdentifier,
      now,
    });

    expect(result.name).toBe('Record Layout');
    expect(result.type).toBe(PageLayoutType.RECORD_PAGE);
    expect(result.objectMetadataUniversalIdentifier).toBe('obj-uuid-1');
  });

  it('should convert a fully specified page layout manifest', () => {
    const result = fromPageLayoutManifestToUniversalFlatPageLayout({
      pageLayoutManifest: {
        universalIdentifier: 'pl-uuid-3',
        name: 'Dashboard Layout',
        type: PageLayoutType.DASHBOARD,
        objectUniversalIdentifier: 'obj-uuid-1',
        defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: 'tab-uuid-1',
      },
      applicationUniversalIdentifier,
      now,
    });

    expect(result.name).toBe('Dashboard Layout');
    expect(result.type).toBe(PageLayoutType.DASHBOARD);
    expect(result.objectMetadataUniversalIdentifier).toBe('obj-uuid-1');
    expect(
      result.defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
    ).toBe('tab-uuid-1');
  });

  it('should keep the first tab unpinned when the manifest says so', () => {
    const result = fromPageLayoutManifestToUniversalFlatPageLayout({
      pageLayoutManifest: {
        universalIdentifier: 'pl-uuid-4',
        name: 'Unpinned Record Layout',
        type: PageLayoutType.RECORD_PAGE,
        objectUniversalIdentifier: 'obj-uuid-1',
        isFirstTabPinned: false,
      },
      applicationUniversalIdentifier,
      now,
    });

    expect(result.isFirstTabPinned).toBe(false);
  });

  it('should keep the filters the manifest declares', () => {
    const filters = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        label: 'Period',
        type: PageLayoutFilterType.DATE,
        position: 0,
        defaultValue: {
          conditions: [
            { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
          ],
        },
      },
    ];

    const result = fromPageLayoutManifestToUniversalFlatPageLayout({
      pageLayoutManifest: {
        universalIdentifier: 'pl-uuid-5',
        name: 'Filtered Dashboard',
        type: PageLayoutType.DASHBOARD,
        filters,
      },
      applicationUniversalIdentifier,
      now,
    });

    expect(result.filters).toEqual(filters);
  });

  it('should treat an empty filter list as no filters', () => {
    const result = fromPageLayoutManifestToUniversalFlatPageLayout({
      pageLayoutManifest: {
        universalIdentifier: 'pl-uuid-6',
        name: 'Unfiltered Dashboard',
        type: PageLayoutType.DASHBOARD,
        filters: [],
      },
      applicationUniversalIdentifier,
      now,
    });

    expect(result.filters).toBeNull();
  });
});
