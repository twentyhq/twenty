import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeFieldsWidgetFieldDiff } from '@/page-layout/utils/computeFieldsWidgetFieldDiff';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';

const mockFieldMetadataItem = {
  id: 'field-meta-1',
  name: 'name',
  label: 'Name',
  type: 'TEXT',
} as FieldMetadataItem;

const makeGroup = (
  overrides: Partial<FieldsWidgetGroup> & { id: string },
): FieldsWidgetGroup => ({
  name: 'Group',
  position: 0,
  isVisible: true,
  fields: [],
  ...overrides,
});

describe('computeFieldsWidgetFieldDiff', () => {
  it('should return empty updates when both arrays are empty', () => {
    const result = computeFieldsWidgetFieldDiff([], []);

    expect(result).toEqual([]);
  });

  it('should return empty updates when fields are identical', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 0,
            isVisible: true,
            globalIndex: 0,
            viewFieldId: 'vf1',
          },
        ],
      }),
    ];

    const result = computeFieldsWidgetFieldDiff(groups, groups);

    expect(result).toEqual([]);
  });

  it('should detect visibility changes', () => {
    const persisted: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 0,
            isVisible: true,
            globalIndex: 0,
            viewFieldId: 'vf1',
          },
        ],
      }),
    ];

    const draft: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 0,
            isVisible: false,
            globalIndex: 0,
            viewFieldId: 'vf1',
          },
        ],
      }),
    ];

    const result = computeFieldsWidgetFieldDiff(persisted, draft);

    expect(result).toEqual([{ viewFieldId: 'vf1', isVisible: false }]);
  });

  it('should detect position changes', () => {
    const persisted: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 0,
            isVisible: true,
            globalIndex: 0,
            viewFieldId: 'vf1',
          },
        ],
      }),
    ];

    const draft: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 3,
            isVisible: true,
            globalIndex: 0,
            viewFieldId: 'vf1',
          },
        ],
      }),
    ];

    const result = computeFieldsWidgetFieldDiff(persisted, draft);

    expect(result).toEqual([{ viewFieldId: 'vf1', position: 3 }]);
  });

  it('should detect group changes (field moved to different group)', () => {
    const persisted: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 0,
            isVisible: true,
            globalIndex: 0,
            viewFieldId: 'vf1',
          },
        ],
      }),
      makeGroup({ id: 'g2' }),
    ];

    const draft: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1' }),
      makeGroup({
        id: 'g2',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 0,
            isVisible: true,
            globalIndex: 0,
            viewFieldId: 'vf1',
          },
        ],
      }),
    ];

    const result = computeFieldsWidgetFieldDiff(persisted, draft);

    expect(result).toEqual([{ viewFieldId: 'vf1', viewFieldGroupId: 'g2' }]);
  });

  it('should detect multiple simultaneous changes on a field', () => {
    const persisted: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 0,
            isVisible: true,
            globalIndex: 0,
            viewFieldId: 'vf1',
          },
        ],
      }),
      makeGroup({ id: 'g2' }),
    ];

    const draft: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1' }),
      makeGroup({
        id: 'g2',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 5,
            isVisible: false,
            globalIndex: 0,
            viewFieldId: 'vf1',
          },
        ],
      }),
    ];

    const result = computeFieldsWidgetFieldDiff(persisted, draft);

    expect(result).toEqual([
      {
        viewFieldId: 'vf1',
        isVisible: false,
        position: 5,
        viewFieldGroupId: 'g2',
      },
    ]);
  });

  it('should skip fields without viewFieldId', () => {
    const persisted: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 0,
            isVisible: true,
            globalIndex: 0,
          },
        ],
      }),
    ];

    const draft: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 5,
            isVisible: false,
            globalIndex: 0,
          },
        ],
      }),
    ];

    const result = computeFieldsWidgetFieldDiff(persisted, draft);

    expect(result).toEqual([]);
  });

  it('should skip fields not found in persisted state', () => {
    const persisted: FieldsWidgetGroup[] = [makeGroup({ id: 'g1' })];

    const draft: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 0,
            isVisible: true,
            globalIndex: 0,
            viewFieldId: 'vf-new',
          },
        ],
      }),
    ];

    const result = computeFieldsWidgetFieldDiff(persisted, draft);

    expect(result).toEqual([]);
  });

  it('should handle multiple fields across multiple groups', () => {
    const persisted: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 0,
            isVisible: true,
            globalIndex: 0,
            viewFieldId: 'vf1',
          },
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 1,
            isVisible: true,
            globalIndex: 1,
            viewFieldId: 'vf2',
          },
        ],
      }),
      makeGroup({
        id: 'g2',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 0,
            isVisible: false,
            globalIndex: 2,
            viewFieldId: 'vf3',
          },
        ],
      }),
    ];

    const draft: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 0,
            isVisible: true,
            globalIndex: 0,
            viewFieldId: 'vf1',
          },
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 1,
            isVisible: false,
            globalIndex: 1,
            viewFieldId: 'vf2',
          },
        ],
      }),
      makeGroup({
        id: 'g2',
        fields: [
          {
            fieldMetadataItem: mockFieldMetadataItem,
            position: 0,
            isVisible: true,
            globalIndex: 2,
            viewFieldId: 'vf3',
          },
        ],
      }),
    ];

    const result = computeFieldsWidgetFieldDiff(persisted, draft);

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ viewFieldId: 'vf2', isVisible: false });
    expect(result).toContainEqual({ viewFieldId: 'vf3', isVisible: true });
  });
});
