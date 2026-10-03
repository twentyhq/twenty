import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { TOGGLE_MINE_RECORD_FILTER_ID } from '@/views/constants/ToggleMineRecordFilterId';
import { buildToggleMineRecordFilter } from '@/views/utils/buildToggleMineRecordFilter';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

const ME_VALUE = JSON.stringify({
  isCurrentWorkspaceMemberSelected: true,
  selectedRecordIds: [],
});

describe('buildToggleMineRecordFilter', () => {
  it('builds a "Me" filter on a relation field', () => {
    expect(
      buildToggleMineRecordFilter({
        id: 'owner-field-id',
        label: 'Account Owner',
        type: FieldMetadataType.RELATION,
      } as FieldMetadataItem),
    ).toEqual({
      id: TOGGLE_MINE_RECORD_FILTER_ID,
      fieldMetadataId: 'owner-field-id',
      value: ME_VALUE,
      displayValue: 'Me',
      type: 'RELATION',
      operand: ViewFilterOperand.IS,
      label: 'Account Owner',
      subFieldName: undefined,
    });
  });

  it('targets the workspace member of an actor field', () => {
    expect(
      buildToggleMineRecordFilter({
        id: 'created-by-field-id',
        label: 'Created by',
        type: FieldMetadataType.ACTOR,
      } as FieldMetadataItem),
    ).toMatchObject({
      id: TOGGLE_MINE_RECORD_FILTER_ID,
      type: 'ACTOR',
      value: ME_VALUE,
      subFieldName: 'workspaceMemberId',
    });
  });
});
