import { ViewFilterOperand } from 'twenty-shared/types';

import { fromViewFilterManifestToUniversalFlatViewFilter } from 'src/engine/core-modules/application/utils/from-view-filter-manifest-to-universal-flat-view-filter.util';

describe('fromViewFilterManifestToUniversalFlatViewFilter', () => {
  const now = '2026-01-01T00:00:00.000Z';
  const applicationUniversalIdentifier = 'app-uuid-1';
  const viewUniversalIdentifier = 'view-uuid-1';

  it('should convert a view filter manifest with defaults', () => {
    const result = fromViewFilterManifestToUniversalFlatViewFilter({
      viewFilterManifest: {
        universalIdentifier: 'vfilter-uuid-1',
        fieldMetadataUniversalIdentifier: 'field-uuid-1',
        operand: ViewFilterOperand.CONTAINS,
        value: 'test',
      },
      viewUniversalIdentifier,
      applicationUniversalIdentifier,
      now,
    });

    expect(result.universalIdentifier).toBe('vfilter-uuid-1');
    expect(result.fieldMetadataUniversalIdentifier).toBe('field-uuid-1');
    expect(result.viewUniversalIdentifier).toBe(viewUniversalIdentifier);
    expect(result.operand).toBe(ViewFilterOperand.CONTAINS);
    expect(result.value).toBe('test');
    expect(result.subFieldName).toBeNull();
    expect(result.viewFilterGroupUniversalIdentifier).toBeNull();
    expect(result.positionInViewFilterGroup).toBeNull();
  });

  it('should respect explicit optional values', () => {
    const result = fromViewFilterManifestToUniversalFlatViewFilter({
      viewFilterManifest: {
        universalIdentifier: 'vfilter-uuid-2',
        fieldMetadataUniversalIdentifier: 'field-uuid-2',
        operand: ViewFilterOperand.IS,
        value: ['a', 'b'],
        subFieldName: 'city',
        viewFilterGroupUniversalIdentifier: 'vfg-uuid-1',
        positionInViewFilterGroup: 2,
      },
      viewUniversalIdentifier,
      applicationUniversalIdentifier,
      now,
    });

    expect(result.subFieldName).toBe('city');
    expect(result.viewFilterGroupUniversalIdentifier).toBe('vfg-uuid-1');
    expect(result.positionInViewFilterGroup).toBe(2);
  });
});
