import { TIMELINE_ACTIVITY_ACTIONS } from 'twenty-shared/timeline';

import { buildTimelineActivityBackfillQuery } from 'src/database/commands/upgrade-version-command/2-33/utils/build-timeline-activity-backfill-query.util';

const NOTE_OBJECT_METADATA_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const TASK_OBJECT_METADATA_ID = '20202020-7f0e-4a3b-9c11-2d5b8e6a1f37';

const buildQuery = (
  overrides: Partial<
    Parameters<typeof buildTimelineActivityBackfillQuery>[0]
  > = {},
) =>
  buildTimelineActivityBackfillQuery({
    schemaName: 'workspace_1wgvd1i',
    objectMetadataIdByNameSingular: [
      ['note', NOTE_OBJECT_METADATA_ID],
      ['task', TASK_OBJECT_METADATA_ID],
    ],
    targetColumnByObjectMetadataId: [],
    ...overrides,
  });

describe('buildTimelineActivityBackfillQuery', () => {
  it('binds every value it interpolates', () => {
    const { query, parameters } = buildQuery({
      targetColumnByObjectMetadataId: [
        ['noteId', NOTE_OBJECT_METADATA_ID],
        ['taskId', TASK_OBJECT_METADATA_ID],
      ],
    });

    expect(query).not.toContain(NOTE_OBJECT_METADATA_ID);
    expect(query).not.toContain(TASK_OBJECT_METADATA_ID);
    expect(parameters).toEqual([
      TIMELINE_ACTIVITY_ACTIONS,
      'note',
      NOTE_OBJECT_METADATA_ID,
      'task',
      TASK_OBJECT_METADATA_ID,
      NOTE_OBJECT_METADATA_ID,
      TASK_OBJECT_METADATA_ID,
    ]);
  });

  it('numbers placeholders contiguously so each maps to its parameter', () => {
    const { query, parameters } = buildQuery({
      targetColumnByObjectMetadataId: [['noteId', NOTE_OBJECT_METADATA_ID]],
    });

    const usedIndexes = [...query.matchAll(/\$(\d+)/g)]
      .map(([, index]) => Number(index))
      .sort((a, b) => a - b);

    expect(usedIndexes).toEqual(
      Array.from({ length: parameters.length }, (_, index) => index + 1),
    );
  });

  it('casts only the first VALUES row, which fixes the column types', () => {
    const { query } = buildQuery();

    expect(query).toContain('($2::text, $3::uuid)');
    expect(query).toContain('($4, $5)');
  });

  it('falls back to a null source when no morph target column exists', () => {
    const { query } = buildQuery({ targetColumnByObjectMetadataId: [] });

    expect(query).toContain('ELSE NULL::uuid');
  });

  it('resolves a link row to a null stored source rather than to itself', () => {
    const { query } = buildQuery();

    expect(query).toContain(`IN ('linked', 'unlinked')`);
    expect(query).toMatch(/WHEN \(source\."name" LIKE 'linked-%'[\s\S]*?THEN NULL/);
  });

  it('only touches rows that have no action yet', () => {
    const { query } = buildQuery();

    expect(query).toContain('WHERE source."action" IS NULL');
  });
});
