import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { TOGGLE_MINE_RECORD_FILTER_ID } from '@/views/constants/ToggleMineRecordFilterId';
import { omitToggleMineRecordFilter } from '@/views/utils/omitToggleMineRecordFilter';
import { ViewFilterOperand } from 'twenty-shared/types';

const buildRecordFilter = (id: string): RecordFilter => ({
  id,
  fieldMetadataId: 'owner-field-id',
  value: '',
  displayValue: '',
  type: 'RELATION',
  operand: ViewFilterOperand.IS,
  label: 'Account Owner',
});

describe('omitToggleMineRecordFilter', () => {
  it('drops the toggle filter and keeps filters on the same field', () => {
    const ownerFilter = buildRecordFilter('owner-filter-id');

    expect(
      omitToggleMineRecordFilter([
        buildRecordFilter(TOGGLE_MINE_RECORD_FILTER_ID),
        ownerFilter,
      ]),
    ).toEqual([ownerFilter]);
  });

  it('returns the filters unchanged when there is no toggle filter', () => {
    const ownerFilter = buildRecordFilter('owner-filter-id');

    expect(omitToggleMineRecordFilter([ownerFilter])).toEqual([ownerFilter]);
  });
});
