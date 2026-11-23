import { getJunctionTargetFieldReference } from '@/object-record/record-column-scope/utils/getJunctionTargetFieldReference';
import { ViewSortDirection } from 'twenty-shared/types';

const SCOPED_RELATION_JUNCTION = {
  targetFieldMetadataItem: { id: 'task-target-task-field' },
};

describe('getJunctionTargetFieldReference', () => {
  it('turns a field reached through the target relation into a field of the target records', () => {
    expect(
      getJunctionTargetFieldReference({
        fieldReference: {
          fieldMetadataId: 'task-target-task-field',
          relationTargetFieldMetadataId: 'task-due-at-field',
          direction: ViewSortDirection.DESC,
          subFieldName: null,
        },
        scopedRelationJunction: SCOPED_RELATION_JUNCTION,
      }),
    ).toEqual({
      fieldMetadataId: 'task-due-at-field',
      relationTargetFieldMetadataId: null,
      direction: ViewSortDirection.DESC,
      subFieldName: null,
    });
  });

  it('has no target field for a field of the join records', () => {
    expect(
      getJunctionTargetFieldReference({
        fieldReference: { fieldMetadataId: 'task-target-created-at-field' },
        scopedRelationJunction: SCOPED_RELATION_JUNCTION,
      }),
    ).toBeUndefined();
  });

  it('has no target field for the target relation itself', () => {
    expect(
      getJunctionTargetFieldReference({
        fieldReference: {
          fieldMetadataId: 'task-target-task-field',
          relationTargetFieldMetadataId: null,
        },
        scopedRelationJunction: SCOPED_RELATION_JUNCTION,
      }),
    ).toBeUndefined();
  });

  it('has no target field for a field reached through another relation of the join records', () => {
    expect(
      getJunctionTargetFieldReference({
        fieldReference: {
          fieldMetadataId: 'task-target-author-field',
          relationTargetFieldMetadataId: 'workspace-member-name-field',
        },
        scopedRelationJunction: SCOPED_RELATION_JUNCTION,
      }),
    ).toBeUndefined();
  });
});
