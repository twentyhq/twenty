import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { filterReadableFieldsWidgetGroups } from '@/page-layout/widgets/fields/utils/filterReadableFieldsWidgetGroups';

const makeFieldMetadataItem = (id: string) => ({ id }) as FieldMetadataItem;

const makeGroup = (id: string, fieldIds: string[]): FieldsWidgetGroup => ({
  id,
  name: id,
  position: 0,
  isVisible: true,
  fields: fieldIds.map((fieldId, index) => ({
    fieldMetadataItem: makeFieldMetadataItem(fieldId),
    position: index,
    isVisible: true,
    globalIndex: index,
  })),
});

describe('filterReadableFieldsWidgetGroups', () => {
  it('removes unreadable fields and reindexes the remaining ones across groups', () => {
    const result = filterReadableFieldsWidgetGroups({
      groups: [makeGroup('first', ['a', 'b']), makeGroup('second', ['c', 'd'])],
      readableFields: ['b', 'd'].map(makeFieldMetadataItem),
    });

    expect(
      result.flatMap((group) =>
        group.fields.map((field) => [
          field.fieldMetadataItem.id,
          field.globalIndex,
        ]),
      ),
    ).toEqual([
      ['b', 0],
      ['d', 1],
    ]);
  });

  it('removes groups with no readable field', () => {
    const result = filterReadableFieldsWidgetGroups({
      groups: [makeGroup('first', ['a']), makeGroup('second', ['b'])],
      readableFields: [makeFieldMetadataItem('b')],
    });

    expect(result.map((group) => group.id)).toEqual(['second']);
  });
});
