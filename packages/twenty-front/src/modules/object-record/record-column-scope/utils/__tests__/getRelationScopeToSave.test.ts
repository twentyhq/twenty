import { getRelationScopeToEdit } from '@/object-record/record-column-scope/utils/getRelationScopeToEdit';
import { getRelationScopeToSave } from '@/object-record/record-column-scope/utils/getRelationScopeToSave';
import {
  type ViewFieldRelationScope,
  type ViewFieldRelationScopeFilter,
  type ViewFieldRelationScopeSort,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';

const SCOPED_RELATION_JUNCTION = {
  targetFieldMetadataItem: { id: 'task-target-task-field' },
};

const ROOT_FILTER_GROUP = {
  id: 'root-filter-group',
  parentFilterGroupId: null,
  logicalOperator: ViewFilterGroupLogicalOperator.AND,
};

const JOIN_RECORD_FILTER: ViewFieldRelationScopeFilter = {
  id: 'join-record-filter',
  fieldMetadataId: 'task-target-created-at-field',
  operand: ViewFilterOperand.IS_IN_PAST,
  value: '',
  subFieldName: null,
  relationTargetFieldMetadataId: null,
  filterGroupId: 'root-filter-group',
};

const STORED_STATUS_FILTER: ViewFieldRelationScopeFilter = {
  id: 'status-filter',
  fieldMetadataId: 'task-target-task-field',
  relationTargetFieldMetadataId: 'task-status-field',
  operand: ViewFilterOperand.IS,
  value: ['TODO'],
  subFieldName: null,
  filterGroupId: 'root-filter-group',
};

const JOIN_RECORD_SORT: ViewFieldRelationScopeSort = {
  fieldMetadataId: 'task-target-created-at-field',
  relationTargetFieldMetadataId: null,
  direction: ViewSortDirection.DESC,
  subFieldName: null,
};

const STORED_DUE_AT_SORT: ViewFieldRelationScopeSort = {
  fieldMetadataId: 'task-target-task-field',
  relationTargetFieldMetadataId: 'task-due-at-field',
  direction: ViewSortDirection.ASC,
  subFieldName: null,
};

const STORED_RELATION_SCOPE: ViewFieldRelationScope = {
  filters: [JOIN_RECORD_FILTER, STORED_STATUS_FILTER],
  filterGroups: [ROOT_FILTER_GROUP],
  sorts: [JOIN_RECORD_SORT, STORED_DUE_AT_SORT],
  limit: 1,
};

const EDITED_TITLE_FILTER: ViewFieldRelationScopeFilter = {
  id: 'title-filter',
  fieldMetadataId: 'task-title-field',
  relationTargetFieldMetadataId: null,
  operand: ViewFilterOperand.CONTAINS,
  value: 'call',
  subFieldName: null,
  filterGroupId: 'root-filter-group',
};

describe('getRelationScopeToSave', () => {
  it('saves the scope of a relation to plain records as it was edited', () => {
    const editedRelationScope: ViewFieldRelationScope = {
      filters: [EDITED_TITLE_FILTER],
      filterGroups: [ROOT_FILTER_GROUP],
      sorts: [],
      limit: 2,
    };

    expect(
      getRelationScopeToSave({
        editedRelationScope,
        storedRelationScope: STORED_RELATION_SCOPE,
        scopedRelationJunction: undefined,
      }),
    ).toBe(editedRelationScope);
  });

  it('saves the filters and sorts on target records through the target relation of the join object', () => {
    expect(
      getRelationScopeToSave({
        editedRelationScope: {
          filters: [EDITED_TITLE_FILTER],
          filterGroups: [ROOT_FILTER_GROUP],
          sorts: [
            {
              fieldMetadataId: 'task-due-at-field',
              relationTargetFieldMetadataId: null,
              direction: ViewSortDirection.DESC,
              subFieldName: null,
            },
          ],
          limit: 3,
        },
        storedRelationScope: undefined,
        scopedRelationJunction: SCOPED_RELATION_JUNCTION,
      }),
    ).toEqual({
      filters: [
        {
          ...EDITED_TITLE_FILTER,
          fieldMetadataId: 'task-target-task-field',
          relationTargetFieldMetadataId: 'task-title-field',
        },
      ],
      filterGroups: [ROOT_FILTER_GROUP],
      sorts: [{ ...STORED_DUE_AT_SORT, direction: ViewSortDirection.DESC }],
      limit: 3,
    });
  });

  it('saves a scope edited without a change as it was stored', () => {
    expect(
      getRelationScopeToSave({
        editedRelationScope: getRelationScopeToEdit({
          relationScope: STORED_RELATION_SCOPE,
          scopedRelationJunction: SCOPED_RELATION_JUNCTION,
        }),
        storedRelationScope: STORED_RELATION_SCOPE,
        scopedRelationJunction: SCOPED_RELATION_JUNCTION,
      }),
    ).toEqual(STORED_RELATION_SCOPE);
  });

  it('keeps the stored filters and sorts on join records when the ones on target records change', () => {
    expect(
      getRelationScopeToSave({
        editedRelationScope: {
          filters: [EDITED_TITLE_FILTER],
          filterGroups: [ROOT_FILTER_GROUP],
          sorts: [],
          limit: null,
        },
        storedRelationScope: STORED_RELATION_SCOPE,
        scopedRelationJunction: SCOPED_RELATION_JUNCTION,
      }),
    ).toEqual({
      filters: [
        JOIN_RECORD_FILTER,
        {
          ...EDITED_TITLE_FILTER,
          fieldMetadataId: 'task-target-task-field',
          relationTargetFieldMetadataId: 'task-title-field',
        },
      ],
      filterGroups: [ROOT_FILTER_GROUP],
      sorts: [JOIN_RECORD_SORT],
      limit: null,
    });
  });

  it('keeps a stored filter on join records without its group once the group is removed', () => {
    expect(
      getRelationScopeToSave({
        editedRelationScope: {
          filters: [],
          filterGroups: [],
          sorts: [],
          limit: 1,
        },
        storedRelationScope: STORED_RELATION_SCOPE,
        scopedRelationJunction: SCOPED_RELATION_JUNCTION,
      }).filters,
    ).toEqual([{ ...JOIN_RECORD_FILTER, filterGroupId: null }]);
  });
});
