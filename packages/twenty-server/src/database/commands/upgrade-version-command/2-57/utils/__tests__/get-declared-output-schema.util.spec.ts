import { getDeclaredOutputSchema } from 'src/database/commands/upgrade-version-command/2-57/utils/get-declared-output-schema.util';

describe('getDeclaredOutputSchema', () => {
  it('turns a declared object output into the schema the builder stored', () => {
    expect(
      getDeclaredOutputSchema([
        {
          type: 'object',
          properties: {
            company: { type: 'record', label: 'Company' },
            score: { type: 'number' },
            details: {
              type: 'object',
              properties: { note: { type: 'string' } },
            },
          },
        },
      ]),
    ).toEqual({
      company: { isLeaf: true, type: 'string', label: 'Company', value: null },
      score: { isLeaf: true, type: 'number', label: 'score', value: null },
      details: {
        isLeaf: false,
        type: 'object',
        label: 'details',
        value: {
          note: { isLeaf: true, type: 'string', label: 'note', value: null },
        },
      },
    });
  });

  it('returns no schema for a declared output that is not an object', () => {
    expect(getDeclaredOutputSchema([{ type: 'string' }])).toEqual({});
  });
});
