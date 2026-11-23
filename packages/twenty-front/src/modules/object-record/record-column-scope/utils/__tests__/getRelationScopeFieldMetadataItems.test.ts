import { getRelationScopeFieldMetadataItems } from '@/object-record/record-column-scope/utils/getRelationScopeFieldMetadataItems';
import { FieldMetadataType } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const taskTargetObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('taskTarget');
const taskObjectMetadataItem = getMockObjectMetadataItemOrThrow('task');

describe('getRelationScopeFieldMetadataItems', () => {
  it('scopes a relation to plain records by every field of the related object', () => {
    expect(
      getRelationScopeFieldMetadataItems({
        relationObjectMetadataItem: taskTargetObjectMetadataItem,
        scopedRelationJunction: undefined,
      }),
    ).toBe(taskTargetObjectMetadataItem.fields);
  });

  it('scopes a join object relation by the fields of the target object that are not relations', () => {
    const fieldNames = getRelationScopeFieldMetadataItems({
      relationObjectMetadataItem: taskTargetObjectMetadataItem,
      scopedRelationJunction: {
        targetObjectMetadataItem: taskObjectMetadataItem,
      },
    }).map(({ name }) => name);

    expect(fieldNames).toEqual(
      expect.arrayContaining(['title', 'status', 'dueAt']),
    );
    expect(fieldNames).not.toContain('assignee');
    expect(fieldNames).not.toContain('taskTargets');
    expect(
      taskObjectMetadataItem.fields.some(
        ({ name, type }) =>
          name === 'assignee' && type === FieldMetadataType.RELATION,
      ),
    ).toBe(true);
  });
});
