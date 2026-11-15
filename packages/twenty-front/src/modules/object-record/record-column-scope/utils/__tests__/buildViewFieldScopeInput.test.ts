import { buildViewFieldScopeInput } from '@/object-record/record-column-scope/utils/buildViewFieldScopeInput';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  ViewFilterGroupLogicalOperator,
  ViewSortDirection,
} from '~/generated-metadata/graphql';

const NAME_FIELD_METADATA_ID = '20202020-0000-4000-8000-000000000001';
const FILTER_GROUP_ID = '20202020-0000-4000-8000-000000000002';

describe('buildViewFieldScopeInput', () => {
  it('removes the scope when it has no filters or sorts', () => {
    expect(
      buildViewFieldScopeInput({
        recordFilters: [],
        recordFilterGroups: [
          {
            id: FILTER_GROUP_ID,
            logicalOperator: RecordFilterGroupLogicalOperator.AND,
          },
        ],
        recordSorts: [],
      }),
    ).toBeNull();
  });

  it('maps record filters, filter groups and sorts to the scope input', () => {
    expect(
      buildViewFieldScopeInput({
        recordFilters: [
          {
            id: '20202020-0000-4000-8000-000000000003',
            fieldMetadataId: NAME_FIELD_METADATA_ID,
            operand: ViewFilterOperand.CONTAINS,
            value: 'renewal',
            displayValue: 'renewal',
            type: 'TEXT',
            label: 'Name',
            recordFilterGroupId: FILTER_GROUP_ID,
            positionInRecordFilterGroup: 0,
          },
        ],
        recordFilterGroups: [
          {
            id: FILTER_GROUP_ID,
            logicalOperator: RecordFilterGroupLogicalOperator.OR,
          },
        ],
        recordSorts: [
          {
            id: '20202020-0000-4000-8000-000000000004',
            fieldMetadataId: NAME_FIELD_METADATA_ID,
            direction: ViewSortDirection.DESC,
          },
        ],
      }),
    ).toEqual({
      viewFilters: [
        {
          id: '20202020-0000-4000-8000-000000000003',
          fieldMetadataId: NAME_FIELD_METADATA_ID,
          operand: ViewFilterOperand.CONTAINS,
          value: 'renewal',
          viewFilterGroupId: FILTER_GROUP_ID,
          positionInViewFilterGroup: 0,
          subFieldName: null,
          relationTargetFieldMetadataId: undefined,
        },
      ],
      viewFilterGroups: [
        {
          id: FILTER_GROUP_ID,
          parentViewFilterGroupId: undefined,
          logicalOperator: ViewFilterGroupLogicalOperator.OR,
          positionInViewFilterGroup: undefined,
        },
      ],
      viewSorts: [
        {
          id: '20202020-0000-4000-8000-000000000004',
          fieldMetadataId: NAME_FIELD_METADATA_ID,
          direction: ViewSortDirection.DESC,
          subFieldName: null,
        },
      ],
    });
  });
});
