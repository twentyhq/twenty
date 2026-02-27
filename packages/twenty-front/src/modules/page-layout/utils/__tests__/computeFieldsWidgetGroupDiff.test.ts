import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeFieldsWidgetGroupDiff } from '@/page-layout/utils/computeFieldsWidgetGroupDiff';
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

describe('computeFieldsWidgetGroupDiff', () => {
  it('should return empty diffs when both arrays are empty', () => {
    const result = computeFieldsWidgetGroupDiff([], []);

    expect(result).toEqual({
      createdGroups: [],
      deletedGroups: [],
      updatedGroups: [],
    });
  });

  it('should return empty diffs when groups are identical', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1', name: 'Group 1', position: 0 }),
      makeGroup({ id: 'g2', name: 'Group 2', position: 1 }),
    ];

    const result = computeFieldsWidgetGroupDiff(groups, groups);

    expect(result).toEqual({
      createdGroups: [],
      deletedGroups: [],
      updatedGroups: [],
    });
  });

  it('should detect created groups', () => {
    const persisted: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1', name: 'Group 1', position: 0 }),
    ];

    const draft: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1', name: 'Group 1', position: 0 }),
      makeGroup({ id: 'g2', name: 'New Group', position: 1 }),
    ];

    const result = computeFieldsWidgetGroupDiff(persisted, draft);

    expect(result.createdGroups).toHaveLength(1);
    expect(result.createdGroups[0].id).toBe('g2');
    expect(result.deletedGroups).toHaveLength(0);
    expect(result.updatedGroups).toHaveLength(0);
  });

  it('should detect deleted groups', () => {
    const persisted: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1', name: 'Group 1', position: 0 }),
      makeGroup({ id: 'g2', name: 'Group 2', position: 1 }),
    ];

    const draft: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1', name: 'Group 1', position: 0 }),
    ];

    const result = computeFieldsWidgetGroupDiff(persisted, draft);

    expect(result.createdGroups).toHaveLength(0);
    expect(result.deletedGroups).toHaveLength(1);
    expect(result.deletedGroups[0].id).toBe('g2');
    expect(result.updatedGroups).toHaveLength(0);
  });

  it('should detect updated groups when name changes', () => {
    const persisted: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1', name: 'Old Name', position: 0 }),
    ];

    const draft: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1', name: 'New Name', position: 0 }),
    ];

    const result = computeFieldsWidgetGroupDiff(persisted, draft);

    expect(result.updatedGroups).toHaveLength(1);
    expect(result.updatedGroups[0].name).toBe('New Name');
  });

  it('should detect updated groups when position changes', () => {
    const persisted: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1', name: 'Group 1', position: 0 }),
    ];

    const draft: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1', name: 'Group 1', position: 5 }),
    ];

    const result = computeFieldsWidgetGroupDiff(persisted, draft);

    expect(result.updatedGroups).toHaveLength(1);
    expect(result.updatedGroups[0].position).toBe(5);
  });

  it('should detect updated groups when visibility changes', () => {
    const persisted: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1', isVisible: true }),
    ];

    const draft: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1', isVisible: false }),
    ];

    const result = computeFieldsWidgetGroupDiff(persisted, draft);

    expect(result.updatedGroups).toHaveLength(1);
    expect(result.updatedGroups[0].isVisible).toBe(false);
  });

  it('should handle simultaneous creates, deletes, and updates', () => {
    const persisted: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1', name: 'Group 1', position: 0 }),
      makeGroup({ id: 'g2', name: 'To Delete', position: 1 }),
      makeGroup({ id: 'g3', name: 'To Update', position: 2 }),
    ];

    const draft: FieldsWidgetGroup[] = [
      makeGroup({ id: 'g1', name: 'Group 1', position: 0 }),
      makeGroup({ id: 'g3', name: 'Updated Name', position: 2 }),
      makeGroup({ id: 'g4', name: 'New Group', position: 3 }),
    ];

    const result = computeFieldsWidgetGroupDiff(persisted, draft);

    expect(result.createdGroups).toHaveLength(1);
    expect(result.createdGroups[0].id).toBe('g4');
    expect(result.deletedGroups).toHaveLength(1);
    expect(result.deletedGroups[0].id).toBe('g2');
    expect(result.updatedGroups).toHaveLength(1);
    expect(result.updatedGroups[0].id).toBe('g3');
  });

  it('should not mark group as updated when fields differ but group props are same', () => {
    const persisted: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        name: 'Group 1',
        position: 0,
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
        name: 'Group 1',
        position: 0,
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

    const result = computeFieldsWidgetGroupDiff(persisted, draft);

    expect(result.updatedGroups).toHaveLength(0);
  });
});
