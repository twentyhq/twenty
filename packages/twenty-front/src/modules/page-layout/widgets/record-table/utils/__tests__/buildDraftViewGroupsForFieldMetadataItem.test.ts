import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { buildDraftViewGroupsForFieldMetadataItem } from '@/page-layout/widgets/record-table/utils/buildDraftViewGroupsForFieldMetadataItem';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

const VIEW_ID = 'view-id';

const baseFieldMetadataItem = {
  id: 'field-metadata-id',
  name: 'stage',
  label: 'Stage',
  type: FieldMetadataType.SELECT,
  isNullable: false,
} as FieldMetadataItem;

describe('buildDraftViewGroupsForFieldMetadataItem', () => {
  it('should build one group per select option, in option order', () => {
    const viewGroups = buildDraftViewGroupsForFieldMetadataItem({
      viewId: VIEW_ID,
      fieldMetadataItem: {
        ...baseFieldMetadataItem,
        options: [
          { id: '1', label: 'New', value: 'NEW', color: 'blue', position: 0 },
          {
            id: '2',
            label: 'Done',
            value: 'DONE',
            color: 'green',
            position: 1,
          },
        ],
      },
    });

    expect(viewGroups).toHaveLength(2);
    expect(viewGroups[0]).toMatchObject({
      viewId: VIEW_ID,
      fieldValue: 'NEW',
      position: 0,
      isVisible: true,
    });
    expect(viewGroups[1]).toMatchObject({
      viewId: VIEW_ID,
      fieldValue: 'DONE',
      position: 1,
      isVisible: true,
    });
  });

  it('should append an empty group for nullable fields', () => {
    const viewGroups = buildDraftViewGroupsForFieldMetadataItem({
      viewId: VIEW_ID,
      fieldMetadataItem: {
        ...baseFieldMetadataItem,
        isNullable: true,
        options: [
          { id: '1', label: 'New', value: 'NEW', color: 'blue', position: 0 },
        ],
      },
    });

    expect(viewGroups).toHaveLength(2);
    expect(viewGroups[1]).toMatchObject({
      fieldValue: '',
      position: 1,
    });
  });

  it('should build no option groups for many-to-one relation fields', () => {
    const viewGroups = buildDraftViewGroupsForFieldMetadataItem({
      viewId: VIEW_ID,
      fieldMetadataItem: {
        ...baseFieldMetadataItem,
        type: FieldMetadataType.RELATION,
        relation: {
          type: RelationType.MANY_TO_ONE,
        } as FieldMetadataItem['relation'],
      },
    });

    expect(viewGroups).toHaveLength(0);
  });
});
