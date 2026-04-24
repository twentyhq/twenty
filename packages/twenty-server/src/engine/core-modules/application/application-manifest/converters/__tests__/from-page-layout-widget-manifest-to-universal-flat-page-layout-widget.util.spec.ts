import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-widget-manifest-to-universal-flat-page-layout-widget.util';

describe('fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget', () => {
  const now = '2026-01-01T00:00:00.000Z';
  const applicationUniversalIdentifier = 'app-uuid-1';
  const pageLayoutTabUniversalIdentifier = 'tab-uuid-1';

  it('should convert a minimal page layout widget manifest', () => {
    const result = fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget({
      pageLayoutWidgetManifest: {
        universalIdentifier: 'widget-uuid-1',
        title: 'My Widget',
        type: WidgetType.VIEW,
        position: { layoutMode: PageLayoutTabLayoutMode.CANVAS },
        configuration: { configurationType: 'VIEW' },
      },
      pageLayoutTabUniversalIdentifier,
      applicationUniversalIdentifier,
      now,
    });

    expect(result.universalIdentifier).toBe('widget-uuid-1');
    expect(result.applicationUniversalIdentifier).toBe(
      applicationUniversalIdentifier,
    );
    expect(result.pageLayoutTabUniversalIdentifier).toBe(
      pageLayoutTabUniversalIdentifier,
    );
    expect(result.title).toBe('My Widget');
    expect(result.type).toBe(WidgetType.VIEW);
    expect(result.objectMetadataUniversalIdentifier).toBeNull();
    expect(result.conditionalDisplay).toBeNull();
    expect(result.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
    });
    expect(result.universalConfiguration).toEqual({
      configurationType: 'VIEW',
    });
  });

  it('should convert a fully specified page layout widget manifest', () => {
    const result = fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget({
      pageLayoutWidgetManifest: {
        universalIdentifier: 'widget-uuid-2',
        title: 'Iframe Widget',
        type: 'IFRAME',
        objectUniversalIdentifier: 'obj-uuid-1',
        position: {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
        configuration: {
          configurationType: 'IFRAME',
          url: 'https://example.com',
        },
      },
      pageLayoutTabUniversalIdentifier,
      applicationUniversalIdentifier,
      now,
    });

    expect(result.title).toBe('Iframe Widget');
    expect(result.type).toBe('IFRAME');
    expect(result.objectMetadataUniversalIdentifier).toBe('obj-uuid-1');
    expect(result.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 1,
    });
    expect(result.universalConfiguration).toEqual({
      configurationType: 'IFRAME',
      url: 'https://example.com',
    });
  });

  it('should preserve a vertical-list position from the manifest', () => {
    const result = fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget({
      pageLayoutWidgetManifest: {
        universalIdentifier: 'widget-uuid-3',
        title: 'Positioned Widget',
        type: WidgetType.GRAPH,
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 2,
        },
        configuration: { configurationType: 'VIEW' },
      },
      pageLayoutTabUniversalIdentifier,
      applicationUniversalIdentifier,
      now,
    });

    expect(result.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 2,
    });
  });
});
