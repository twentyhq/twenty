import { getViewFieldRelationScopeInput } from '@/views/utils/getViewFieldRelationScopeInput';
import {
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';

const FILTER_ID = '20202020-0000-4000-8000-0000000000f1';
const FILTER_GROUP_ID = '20202020-0000-4000-8000-0000000000a1';
const FIELD_METADATA_ID = '20202020-0000-4000-8000-0000000000b1';

describe('getViewFieldRelationScopeInput', () => {
  it('keeps an absent scope absent', () => {
    expect(getViewFieldRelationScopeInput(undefined)).toBeUndefined();
    expect(getViewFieldRelationScopeInput(null)).toBeNull();
  });

  it('drops the __typename the API adds on every level', () => {
    const relationScopeFromApi = {
      __typename: 'ViewFieldRelationScope',
      filters: [
        {
          __typename: 'ViewFieldRelationScopeFilter',
          id: FILTER_ID,
          fieldMetadataId: FIELD_METADATA_ID,
          operand: ViewFilterOperand.CONTAINS,
          value: 'cto',
          subFieldName: null,
          relationTargetFieldMetadataId: null,
          filterGroupId: FILTER_GROUP_ID,
        },
      ],
      filterGroups: [
        {
          __typename: 'ViewFieldRelationScopeFilterGroup',
          id: FILTER_GROUP_ID,
          parentFilterGroupId: null,
          logicalOperator: ViewFilterGroupLogicalOperator.AND,
        },
      ],
      sorts: [
        {
          __typename: 'ViewFieldRelationScopeSort',
          fieldMetadataId: FIELD_METADATA_ID,
          direction: ViewSortDirection.DESC,
          subFieldName: null,
          relationTargetFieldMetadataId: null,
        },
      ],
      limit: 2,
    };

    expect(getViewFieldRelationScopeInput(relationScopeFromApi)).toEqual({
      filters: [
        {
          id: FILTER_ID,
          fieldMetadataId: FIELD_METADATA_ID,
          operand: ViewFilterOperand.CONTAINS,
          value: 'cto',
          subFieldName: null,
          relationTargetFieldMetadataId: null,
          filterGroupId: FILTER_GROUP_ID,
        },
      ],
      filterGroups: [
        {
          id: FILTER_GROUP_ID,
          parentFilterGroupId: null,
          logicalOperator: ViewFilterGroupLogicalOperator.AND,
        },
      ],
      sorts: [
        {
          fieldMetadataId: FIELD_METADATA_ID,
          direction: ViewSortDirection.DESC,
          subFieldName: null,
          relationTargetFieldMetadataId: null,
        },
      ],
      limit: 2,
    });
  });
});
