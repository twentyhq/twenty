import { ViewSortDirection } from 'twenty-shared/types';

import { fromViewSortManifestToUniversalFlatViewSort } from 'src/engine/core-modules/application/application-manifest/converters/from-view-sort-manifest-to-universal-flat-view-sort.util';

describe('fromViewSortManifestToUniversalFlatViewSort', () => {
  const now = '2026-01-01T00:00:00.000Z';
  const applicationUniversalIdentifier = 'app-uuid-1';
  const viewUniversalIdentifier = 'view-uuid-1';

  it('should convert a view sort manifest with ASC direction', () => {
    const result = fromViewSortManifestToUniversalFlatViewSort({
      viewSortManifest: {
        universalIdentifier: 'vsort-uuid-1',
        fieldMetadataUniversalIdentifier: 'field-uuid-1',
        direction: ViewSortDirection.ASC,
      },
      viewUniversalIdentifier,
      applicationUniversalIdentifier,
      now,
    });

    expect(result.universalIdentifier).toBe('vsort-uuid-1');
    expect(result.fieldMetadataUniversalIdentifier).toBe('field-uuid-1');
    expect(result.viewUniversalIdentifier).toBe(viewUniversalIdentifier);
    expect(result.applicationUniversalIdentifier).toBe(
      applicationUniversalIdentifier,
    );
    expect(result.direction).toBe(ViewSortDirection.ASC);
    expect(result.createdAt).toBe(now);
    expect(result.updatedAt).toBe(now);
    expect(result.deletedAt).toBeNull();
  });

  it('should convert a view sort manifest with DESC direction', () => {
    const result = fromViewSortManifestToUniversalFlatViewSort({
      viewSortManifest: {
        universalIdentifier: 'vsort-uuid-2',
        fieldMetadataUniversalIdentifier: 'field-uuid-2',
        direction: ViewSortDirection.DESC,
      },
      viewUniversalIdentifier,
      applicationUniversalIdentifier,
      now,
    });

    expect(result.direction).toBe(ViewSortDirection.DESC);
  });
});
