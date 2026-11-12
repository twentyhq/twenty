import { computeFieldMetadataOptionBackfill } from 'src/database/commands/upgrade-version-command/2-57/utils/compute-field-metadata-option-backfill.util';

const FIELD_ID = '20202020-0000-4000-8000-000000000001';
const OTHER_FIELD_ID = '20202020-0000-4000-8000-000000000002';
const APPLICATION_ID = '20202020-0000-4000-8000-0000000000aa';
const OPTION_ID = '20202020-0000-4000-8000-000000000101';
const OTHER_OPTION_ID = '20202020-0000-4000-8000-000000000102';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('computeFieldMetadataOptionBackfill', () => {
  it('keeps valid option ids as universal identifiers', () => {
    const { optionsToRewriteByFieldMetadataId, optionRowsToInsert } =
      computeFieldMetadataOptionBackfill({
        enumFields: [
          {
            id: FIELD_ID,
            applicationId: APPLICATION_ID,
            options: [
              {
                id: OPTION_ID,
                value: 'OPEN',
                label: 'Open',
                color: 'green',
                position: 0,
              },
              {
                id: OTHER_OPTION_ID,
                value: 'CLOSED',
                label: 'Closed',
                position: 1,
              },
            ],
          },
        ],
        existingFieldMetadataIdByUniversalIdentifier: new Map(),
      });

    expect(optionsToRewriteByFieldMetadataId.size).toBe(0);
    expect(optionRowsToInsert).toEqual([
      {
        universalIdentifier: OPTION_ID,
        fieldMetadataId: FIELD_ID,
        applicationId: APPLICATION_ID,
        value: 'OPEN',
        label: 'Open',
        color: 'green',
        position: 0,
      },
      {
        universalIdentifier: OTHER_OPTION_ID,
        fieldMetadataId: FIELD_ID,
        applicationId: APPLICATION_ID,
        value: 'CLOSED',
        label: 'Closed',
        color: null,
        position: 1,
      },
    ]);
  });

  it('regenerates uppercase and pre-v4 ids, which cannot be universal identifiers', () => {
    const { optionsToRewriteByFieldMetadataId, optionRowsToInsert } =
      computeFieldMetadataOptionBackfill({
        enumFields: [
          {
            id: FIELD_ID,
            applicationId: APPLICATION_ID,
            options: [
              {
                id: OPTION_ID.toUpperCase(),
                value: 'OPEN',
                label: 'Open',
                position: 0,
              },
              {
                id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
                value: 'CLOSED',
                label: 'Closed',
                position: 1,
              },
            ],
          },
        ],
        existingFieldMetadataIdByUniversalIdentifier: new Map(),
      });

    const rewrittenOptions = optionsToRewriteByFieldMetadataId.get(FIELD_ID);

    expect(rewrittenOptions?.map((option) => option.id)).toEqual([
      expect.stringMatching(UUID_PATTERN),
      expect.stringMatching(UUID_PATTERN),
    ]);
    expect(
      optionRowsToInsert.map((row) => row.universalIdentifier),
    ).toEqual(rewrittenOptions?.map((option) => option.id));
  });

  it('regenerates missing and reused ids and writes them back to the field', () => {
    const { optionsToRewriteByFieldMetadataId, optionRowsToInsert } =
      computeFieldMetadataOptionBackfill({
        enumFields: [
          {
            id: FIELD_ID,
            applicationId: APPLICATION_ID,
            options: [
              { value: 'OPEN', label: 'Open', position: 0 },
              { id: 'not-a-uuid', value: 'CLOSED', label: 'Closed' },
            ],
          },
          {
            id: OTHER_FIELD_ID,
            applicationId: APPLICATION_ID,
            options: [{ id: OPTION_ID, value: 'LOW', label: 'Low' }],
          },
        ],
        existingFieldMetadataIdByUniversalIdentifier: new Map([
          [OPTION_ID, FIELD_ID],
        ]),
      });

    const rewrittenOptions = [
      ...(optionsToRewriteByFieldMetadataId.get(FIELD_ID) ?? []),
      ...(optionsToRewriteByFieldMetadataId.get(OTHER_FIELD_ID) ?? []),
    ];

    expect(rewrittenOptions).toHaveLength(3);
    expect(rewrittenOptions.map(({ id }) => id)).not.toContain(OPTION_ID);
    expect(new Set(rewrittenOptions.map(({ id }) => id)).size).toBe(3);
    expect(
      optionRowsToInsert.map(({ universalIdentifier, position }) => [
        UUID_PATTERN.test(universalIdentifier),
        position,
      ]),
    ).toEqual([
      [true, 0],
      [true, 1],
      [true, 0],
    ]);
  });

  it('inserts a single row per value', () => {
    const { optionsToRewriteByFieldMetadataId, optionRowsToInsert } =
      computeFieldMetadataOptionBackfill({
        enumFields: [
          {
            id: FIELD_ID,
            applicationId: APPLICATION_ID,
            options: [
              { id: OPTION_ID, value: 'OPEN', label: 'Open', position: 0 },
              { id: OPTION_ID, value: 'OPEN', label: 'Open', position: 1 },
            ],
          },
        ],
        existingFieldMetadataIdByUniversalIdentifier: new Map(),
      });

    expect(optionRowsToInsert).toHaveLength(1);
    expect(optionsToRewriteByFieldMetadataId.get(FIELD_ID)).toHaveLength(2);
  });
});
