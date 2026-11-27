import { getRelationScopeToEdit } from '@/object-record/record-column-scope/utils/getRelationScopeToEdit';
import {
  type ViewFieldRelationScope,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';

const SCOPED_RELATION_JUNCTION = {
  targetFieldMetadataItem: { id: 'task-target-task-field' },
};

const STORED_RELATION_SCOPE: ViewFieldRelationScope = {
  filters: [
    {
      id: 'join-record-filter',
      fieldMetadataId: 'task-target-created-at-field',
      operand: ViewFilterOperand.IS_IN_PAST,
      value: '',
      filterGroupId: 'root-filter-group',
    },
    {
      id: 'status-filter',
      fieldMetadataId: 'task-target-task-field',
      relationTargetFieldMetadataId: 'task-status-field',
      operand: ViewFilterOperand.IS,
      value: ['TODO'],
      filterGroupId: 'root-filter-group',
    },
  ],
  filterGroups: [
    {
      id: 'root-filter-group',
      logicalOperator: ViewFilterGroupLogicalOperator.AND,
    },
  ],
  sorts: [
    {
      fieldMetadataId: 'task-target-task-field',
      relationTargetFieldMetadataId: 'task-due-at-field',
      direction: ViewSortDirection.ASC,
    },
    {
      fieldMetadataId: 'task-target-created-at-field',
      direction: ViewSortDirection.DESC,
    },
  ],
  limit: 1,
};

describe('getRelationScopeToEdit', () => {
  it('edits the scope of a relation to plain records as it is stored', () => {
    expect(
      getRelationScopeToEdit({
        relationScope: STORED_RELATION_SCOPE,
        scopedRelationJunction: undefined,
      }),
    ).toBe(STORED_RELATION_SCOPE);
  });

  it('edits the scope of a join object relation by the fields of its target records only', () => {
    expect(
      getRelationScopeToEdit({
        relationScope: STORED_RELATION_SCOPE,
        scopedRelationJunction: SCOPED_RELATION_JUNCTION,
      }),
    ).toEqual({
      filters: [
        {
          id: 'status-filter',
          fieldMetadataId: 'task-status-field',
          relationTargetFieldMetadataId: null,
          operand: ViewFilterOperand.IS,
          value: ['TODO'],
          filterGroupId: 'root-filter-group',
        },
      ],
      filterGroups: STORED_RELATION_SCOPE.filterGroups,
      sorts: [
        {
          fieldMetadataId: 'task-due-at-field',
          relationTargetFieldMetadataId: null,
          direction: ViewSortDirection.ASC,
        },
      ],
      limit: 1,
    });
  });
});
