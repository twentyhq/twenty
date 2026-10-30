import { computeRecordGroupOptionsFilter } from '@/object-record/record-group/utils/computeRecordGroupOptionsFilter';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';
import { FieldMetadataType } from 'twenty-shared/types';
import { combineFilters } from 'twenty-shared/utils';

// Mirrors useRecordIndexGroupCommonQueryVariables + useRecordBoardQueryIdentifier:
// the board query identifier is derived from the ordered list of visible group
// values, so RecordBoardQueryEffect sees a "query change" (full reload, scroll
// reset) on a plain column reorder or a column hide.
const buildBoardQueryIdentifier = (visibleValues: (string | null)[]) => {
  const recordGroupOptionsFilter = computeRecordGroupOptionsFilter({
    recordGroupFieldMetadata: {
      id: 'stage-field-id',
      name: 'stage',
      type: FieldMetadataType.SELECT,
    } as any,
    recordGroupValues: visibleValues,
  });

  const combinedFilters = combineFilters([{}, {}, recordGroupOptionsFilter]);

  return getQueryIdentifier({
    objectNameSingular: 'opportunity',
    filter: combinedFilters,
    orderBy: [],
  });
};

describe('record board query identifier vs group order / visibility', () => {
  it('changes when two visible columns are swapped (column reorder => full reload)', () => {
    const before = buildBoardQueryIdentifier(['NEW', 'SCREENING', 'MEETING']);
    const afterMoveRight = buildBoardQueryIdentifier([
      'SCREENING',
      'NEW',
      'MEETING',
    ]);

    expect(afterMoveRight).not.toEqual(before);
  });

  it('changes when a column is hidden (hide => full reload with scroll reset)', () => {
    const before = buildBoardQueryIdentifier(['NEW', 'SCREENING', 'MEETING']);
    const afterHide = buildBoardQueryIdentifier(['NEW', 'MEETING']);

    expect(afterHide).not.toEqual(before);
  });

  it('puts every visible value in a single "in" list, with no cap, for 300 groups', () => {
    const values = Array.from({ length: 300 }, (_, index) => `OPTION_${index}`);

    const filter = computeRecordGroupOptionsFilter({
      recordGroupFieldMetadata: {
        id: 'stage-field-id',
        name: 'stage',
        type: FieldMetadataType.SELECT,
      } as any,
      recordGroupValues: [...values, null],
    });

    expect(filter).toEqual({
      or: [{ stage: { is: 'NULL' } }, { stage: { in: values } }],
    });
    expect((filter as any).or[1].stage.in).toHaveLength(300);
  });
});
