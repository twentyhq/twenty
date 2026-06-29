import {
  type FlatIndexNameStatus,
  planIndexNameNormalization,
} from 'src/database/commands/upgrade-version-command/2-18/utils/plan-index-name-normalization.util';

const buildStatus = (
  overrides: Partial<FlatIndexNameStatus> &
    Pick<FlatIndexNameStatus, 'indexMetadataId' | 'currentName' | 'expectedName'>,
): FlatIndexNameStatus => ({
  objectMetadataId: 'object-1',
  ...overrides,
});

describe('planIndexNameNormalization', () => {
  it('returns no operations for an empty input', () => {
    expect(planIndexNameNormalization([])).toEqual([]);
  });

  it('returns no operations when every index name already matches', () => {
    const statuses = [
      buildStatus({
        indexMetadataId: 'index-1',
        currentName: 'IDX_UNIQUE_aaa',
        expectedName: 'IDX_UNIQUE_aaa',
      }),
      buildStatus({
        indexMetadataId: 'index-2',
        currentName: 'IDX_bbb',
        expectedName: 'IDX_bbb',
      }),
    ];

    expect(planIndexNameNormalization(statuses)).toEqual([]);
  });

  it('renames a single legacy-named index to its expected name', () => {
    const statuses = [
      buildStatus({
        indexMetadataId: 'index-1',
        currentName: 'legacyhash000000000000000000',
        expectedName: 'IDX_UNIQUE_newhash',
      }),
    ];

    expect(planIndexNameNormalization(statuses)).toEqual([
      {
        type: 'rename',
        indexMetadataId: 'index-1',
        objectMetadataId: 'object-1',
        fromName: 'legacyhash000000000000000000',
        toName: 'IDX_UNIQUE_newhash',
      },
    ]);
  });

  it('renames the survivor and drops the duplicate when two legacy indexes resolve to the same name', () => {
    const statuses = [
      buildStatus({
        indexMetadataId: 'index-legacy-a',
        currentName: 'legacyhashA',
        expectedName: 'IDX_UNIQUE_shared',
      }),
      buildStatus({
        indexMetadataId: 'index-legacy-b',
        currentName: 'legacyhashB',
        expectedName: 'IDX_UNIQUE_shared',
      }),
    ];

    expect(planIndexNameNormalization(statuses)).toEqual([
      {
        type: 'rename',
        indexMetadataId: 'index-legacy-a',
        objectMetadataId: 'object-1',
        fromName: 'legacyhashA',
        toName: 'IDX_UNIQUE_shared',
      },
      {
        type: 'dropRedundant',
        indexMetadataId: 'index-legacy-b',
        objectMetadataId: 'object-1',
        redundantName: 'legacyhashB',
        keptName: 'IDX_UNIQUE_shared',
      },
    ]);
  });

  it('keeps the already-correct twin and only drops the legacy duplicate (no rename)', () => {
    const statuses = [
      buildStatus({
        indexMetadataId: 'index-legacy',
        currentName: 'legacyhash',
        expectedName: 'IDX_UNIQUE_shared',
      }),
      buildStatus({
        indexMetadataId: 'index-correct',
        currentName: 'IDX_UNIQUE_shared',
        expectedName: 'IDX_UNIQUE_shared',
      }),
    ];

    expect(planIndexNameNormalization(statuses)).toEqual([
      {
        type: 'dropRedundant',
        indexMetadataId: 'index-legacy',
        objectMetadataId: 'object-1',
        redundantName: 'legacyhash',
        keptName: 'IDX_UNIQUE_shared',
      },
    ]);
  });

  it('handles a mix of correct, legacy, and duplicate indexes across objects', () => {
    const statuses = [
      // already correct -> ignored
      buildStatus({
        indexMetadataId: 'ok',
        objectMetadataId: 'object-a',
        currentName: 'IDX_ok',
        expectedName: 'IDX_ok',
      }),
      // legacy single -> rename
      buildStatus({
        indexMetadataId: 'legacy-single',
        objectMetadataId: 'object-a',
        currentName: 'oldname',
        expectedName: 'IDX_renamed',
      }),
      // duplicate pair on another object -> rename + drop
      buildStatus({
        indexMetadataId: 'dup-1',
        objectMetadataId: 'object-b',
        currentName: 'oldDup1',
        expectedName: 'IDX_UNIQUE_dup',
      }),
      buildStatus({
        indexMetadataId: 'dup-2',
        objectMetadataId: 'object-b',
        currentName: 'oldDup2',
        expectedName: 'IDX_UNIQUE_dup',
      }),
    ];

    const operations = planIndexNameNormalization(statuses);

    expect(operations).toHaveLength(3);
    expect(operations).toContainEqual({
      type: 'rename',
      indexMetadataId: 'legacy-single',
      objectMetadataId: 'object-a',
      fromName: 'oldname',
      toName: 'IDX_renamed',
    });
    expect(operations).toContainEqual({
      type: 'rename',
      indexMetadataId: 'dup-1',
      objectMetadataId: 'object-b',
      fromName: 'oldDup1',
      toName: 'IDX_UNIQUE_dup',
    });
    expect(operations).toContainEqual({
      type: 'dropRedundant',
      indexMetadataId: 'dup-2',
      objectMetadataId: 'object-b',
      redundantName: 'oldDup2',
      keptName: 'IDX_UNIQUE_dup',
    });
  });
});
