import { AggregateOperations } from 'twenty-shared/types';

import { fromViewFieldManifestToUniversalFlatViewField } from 'src/engine/core-modules/application/utils/from-view-field-manifest-to-universal-flat-view-field.util';

describe('fromViewFieldManifestToUniversalFlatViewField', () => {
  const now = '2026-01-01T00:00:00.000Z';
  const applicationUniversalIdentifier = 'app-uuid-1';
  const viewUniversalIdentifier = 'view-uuid-1';

  it('should convert a view field manifest with defaults', () => {
    const result = fromViewFieldManifestToUniversalFlatViewField({
      viewFieldManifest: {
        universalIdentifier: 'vf-uuid-1',
        fieldMetadataUniversalIdentifier: 'field-uuid-1',
        position: 0,
      },
      viewUniversalIdentifier,
      applicationUniversalIdentifier,
      now,
    });

    expect(result.universalIdentifier).toBe('vf-uuid-1');
    expect(result.fieldMetadataUniversalIdentifier).toBe('field-uuid-1');
    expect(result.viewUniversalIdentifier).toBe(viewUniversalIdentifier);
    expect(result.isVisible).toBe(true);
    expect(result.size).toBe(0);
    expect(result.position).toBe(0);
    expect(result.aggregateOperation).toBeNull();
    expect(result.viewFieldGroupUniversalIdentifier).toBeNull();
  });

  it('should respect explicit values', () => {
    const result = fromViewFieldManifestToUniversalFlatViewField({
      viewFieldManifest: {
        universalIdentifier: 'vf-uuid-2',
        fieldMetadataUniversalIdentifier: 'field-uuid-2',
        position: 5,
        isVisible: false,
        size: 200,
        aggregateOperation: AggregateOperations.COUNT,
        viewFieldGroupUniversalIdentifier: 'vfg-uuid-1',
      },
      viewUniversalIdentifier,
      applicationUniversalIdentifier,
      now,
    });

    expect(result.isVisible).toBe(false);
    expect(result.size).toBe(200);
    expect(result.position).toBe(5);
    expect(result.aggregateOperation).toBe(AggregateOperations.COUNT);
    expect(result.viewFieldGroupUniversalIdentifier).toBe('vfg-uuid-1');
  });
});
