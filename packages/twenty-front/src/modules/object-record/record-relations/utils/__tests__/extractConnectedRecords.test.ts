import { extractConnectedRecords } from '@/object-record/record-relations/utils/extractConnectedRecords';

describe('extractConnectedRecords', () => {
  it('returns empty for nullish values', () => {
    expect(extractConnectedRecords(null)).toEqual([]);
    expect(extractConnectedRecords(undefined)).toEqual([]);
  });

  it('extracts a many-to-one nested record', () => {
    expect(extractConnectedRecords({ id: 'person-1', name: 'Ada' })).toEqual([
      { id: 'person-1', name: 'Ada' },
    ]);
  });

  it('extracts one-to-many connection edges', () => {
    expect(
      extractConnectedRecords({
        edges: [
          { node: { id: '1', name: 'A' } },
          { node: { id: '2', name: 'B' } },
        ],
      }),
    ).toEqual([
      { id: '1', name: 'A' },
      { id: '2', name: 'B' },
    ]);
  });

  it('extracts a plain array of records', () => {
    expect(
      extractConnectedRecords([{ id: '1' }, { id: '2' }]),
    ).toEqual([{ id: '1' }, { id: '2' }]);
  });
});
