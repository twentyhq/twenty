import { computeScopedRelationArgs } from '@/object-record/record-column-scope/utils/computeScopedRelationArgs';
import { ViewFilterOperand, ViewSortDirection } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const taskObjectMetadataItem = getMockObjectMetadataItemOrThrow('task');
const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const getTaskFieldOrThrow = (fieldName: string) => {
  const field = taskObjectMetadataItem.fields.find(
    ({ name }) => name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Task field ${fieldName} not found`);
  }

  return field;
};

describe('computeScopedRelationArgs', () => {
  it('only limits related records when the column has no scope view', () => {
    expect(
      computeScopedRelationArgs({
        scopeView: undefined,
        recordLimit: 1,
        relationObjectMetadataItem: taskObjectMetadataItem,
        objectMetadataItems,
        fieldMetadataItems: taskObjectMetadataItem.fields,
        filterValueDependencies: {},
      }),
    ).toEqual({
      filter: {},
      orderBy: [{ position: 'AscNullsFirst' }],
      first: 1,
    });
  });

  it('turns the scope view filters and sorts into nested arguments', () => {
    const titleField = getTaskFieldOrThrow('title');
    const dueAtField = getTaskFieldOrThrow('dueAt');

    const { filter, orderBy, first } = computeScopedRelationArgs({
      scopeView: {
        viewFilters: [
          {
            id: '20202020-0000-4000-8000-0000000000f1',
            fieldMetadataId: titleField.id,
            operand: ViewFilterOperand.CONTAINS,
            value: 'renewal',
          },
        ],
        viewFilterGroups: [],
        viewSorts: [
          {
            id: '20202020-0000-4000-8000-0000000000f2',
            fieldMetadataId: dueAtField.id,
            direction: ViewSortDirection.ASC,
          },
        ],
      },
      recordLimit: null,
      relationObjectMetadataItem: taskObjectMetadataItem,
      objectMetadataItems,
      fieldMetadataItems: taskObjectMetadataItem.fields,
      filterValueDependencies: {},
    });

    expect(filter).toEqual({
      title: { ilike: '%renewal%' },
    });
    expect(orderBy).toEqual([
      { dueAt: 'AscNullsLast' },
      { position: 'AscNullsFirst' },
    ]);
    expect(first).toBeUndefined();
  });
});
