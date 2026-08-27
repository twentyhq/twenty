import { computeFieldMetadataLayoutPositionUpdates } from '@/settings/data-model/object-details/utils/computeFieldMetadataLayoutPositionUpdates';

describe('computeFieldMetadataLayoutPositionUpdates', () => {
  it('writes a single fractional position between two positioned neighbors', () => {
    const updates = computeFieldMetadataLayoutPositionUpdates({
      orderedFieldMetadataItems: [
        { id: 'a', position: 0 },
        { id: 'b', position: 1 },
        { id: 'c', position: 2 },
      ],
      movedFieldMetadataId: 'c',
      precedingFieldMetadataId: 'a',
    });

    expect(updates).toEqual([{ fieldMetadataId: 'c', position: 0.5 }]);
  });

  it('places the moved field before every positioned one when dropped first', () => {
    const updates = computeFieldMetadataLayoutPositionUpdates({
      orderedFieldMetadataItems: [
        { id: 'a', position: 0 },
        { id: 'b', position: 1 },
      ],
      movedFieldMetadataId: 'b',
      precedingFieldMetadataId: null,
    });

    expect(updates).toEqual([{ fieldMetadataId: 'b', position: -1 }]);
  });

  it('appends after the last positioned field when dropped after it', () => {
    const updates = computeFieldMetadataLayoutPositionUpdates({
      orderedFieldMetadataItems: [
        { id: 'a', position: 0 },
        { id: 'b', position: 1 },
      ],
      movedFieldMetadataId: 'a',
      precedingFieldMetadataId: 'b',
    });

    expect(updates).toEqual([{ fieldMetadataId: 'a', position: 2 }]);
  });

  it('appends after the last positioned field when dropped into the unpositioned tail', () => {
    const updates = computeFieldMetadataLayoutPositionUpdates({
      orderedFieldMetadataItems: [
        { id: 'a', position: 0 },
        { id: 'b', position: 4 },
        { id: 'tail-1', position: null },
        { id: 'tail-2', position: null },
      ],
      movedFieldMetadataId: 'a',
      precedingFieldMetadataId: 'tail-1',
    });

    expect(updates).toEqual([{ fieldMetadataId: 'a', position: 5 }]);
  });

  it('positions an unpositioned field dropped between positioned neighbors', () => {
    const updates = computeFieldMetadataLayoutPositionUpdates({
      orderedFieldMetadataItems: [
        { id: 'a', position: 0 },
        { id: 'b', position: 1 },
        { id: 'tail-1', position: null },
      ],
      movedFieldMetadataId: 'tail-1',
      precedingFieldMetadataId: 'a',
    });

    expect(updates).toEqual([{ fieldMetadataId: 'tail-1', position: 0.5 }]);
  });

  it('never touches unpositioned bystanders', () => {
    const updates = computeFieldMetadataLayoutPositionUpdates({
      orderedFieldMetadataItems: [
        { id: 'a', position: 0 },
        { id: 'b', position: 1 },
        { id: 'c', position: 2 },
        { id: 'tail-1', position: null },
      ],
      movedFieldMetadataId: 'c',
      precedingFieldMetadataId: 'a',
    });

    expect(updates.map((update) => update.fieldMetadataId)).toEqual(['c']);
  });

  it('reindexes only the positioned fields when neighbor positions collide', () => {
    const updates = computeFieldMetadataLayoutPositionUpdates({
      orderedFieldMetadataItems: [
        { id: 'a', position: 1 },
        { id: 'b', position: 1 },
        { id: 'c', position: 3 },
        { id: 'tail-1', position: null },
      ],
      movedFieldMetadataId: 'c',
      precedingFieldMetadataId: 'a',
    });

    expect(updates).toEqual([
      { fieldMetadataId: 'a', position: 0 },
      { fieldMetadataId: 'c', position: 1 },
      { fieldMetadataId: 'b', position: 2 },
    ]);
  });

  it('returns no update for an unknown moved field', () => {
    expect(
      computeFieldMetadataLayoutPositionUpdates({
        orderedFieldMetadataItems: [{ id: 'a', position: 0 }],
        movedFieldMetadataId: 'unknown',
        precedingFieldMetadataId: null,
      }),
    ).toEqual([]);
  });

  it('returns no update for an unknown preceding field', () => {
    expect(
      computeFieldMetadataLayoutPositionUpdates({
        orderedFieldMetadataItems: [
          { id: 'a', position: 0 },
          { id: 'b', position: 1 },
        ],
        movedFieldMetadataId: 'a',
        precedingFieldMetadataId: 'unknown',
      }),
    ).toEqual([]);
  });
});
