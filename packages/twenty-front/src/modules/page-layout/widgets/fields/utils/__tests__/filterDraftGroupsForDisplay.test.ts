import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { filterDraftGroupsForDisplay } from '@/page-layout/widgets/fields/utils/filterDraftGroupsForDisplay';

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

const makeField = (
  overrides: Partial<FieldsWidgetGroup['fields'][number]> = {},
): FieldsWidgetGroup['fields'][number] => ({
  fieldMetadataItem: mockFieldMetadataItem,
  position: 0,
  isVisible: true,
  globalIndex: 0,
  viewFieldId: 'vf1',
  ...overrides,
});

describe('filterDraftGroupsForDisplay', () => {
  it('should return empty array for empty input', () => {
    const result = filterDraftGroupsForDisplay([]);

    expect(result).toEqual([]);
  });

  it('should filter out non-visible groups', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        isVisible: true,
        fields: [makeField()],
      }),
      makeGroup({
        id: 'g2',
        isVisible: false,
        fields: [makeField({ viewFieldId: 'vf2' })],
      }),
    ];

    const result = filterDraftGroupsForDisplay(groups);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('g1');
  });

  it('should filter out non-visible fields within groups', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          makeField({ isVisible: true, viewFieldId: 'vf1' }),
          makeField({ isVisible: false, viewFieldId: 'vf2' }),
          makeField({ isVisible: true, viewFieldId: 'vf3' }),
        ],
      }),
    ];

    const result = filterDraftGroupsForDisplay(groups);

    expect(result).toHaveLength(1);
    expect(result[0].fields).toHaveLength(2);
    expect(result[0].fields[0].viewFieldId).toBe('vf1');
    expect(result[0].fields[1].viewFieldId).toBe('vf3');
  });

  it('should remove groups where all fields are hidden', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [makeField({ isVisible: false })],
      }),
    ];

    const result = filterDraftGroupsForDisplay(groups);

    expect(result).toHaveLength(0);
  });

  it('should sort groups by position', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g3',
        position: 2,
        fields: [makeField({ viewFieldId: 'vf3' })],
      }),
      makeGroup({
        id: 'g1',
        position: 0,
        fields: [makeField({ viewFieldId: 'vf1' })],
      }),
      makeGroup({
        id: 'g2',
        position: 1,
        fields: [makeField({ viewFieldId: 'vf2' })],
      }),
    ];

    const result = filterDraftGroupsForDisplay(groups);

    expect(result.map((g) => g.id)).toEqual(['g1', 'g2', 'g3']);
  });

  it('should sort fields by position within each group', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        fields: [
          makeField({ position: 2, viewFieldId: 'vf2' }),
          makeField({ position: 0, viewFieldId: 'vf0' }),
          makeField({ position: 1, viewFieldId: 'vf1' }),
        ],
      }),
    ];

    const result = filterDraftGroupsForDisplay(groups);

    expect(result[0].fields.map((f) => f.viewFieldId)).toEqual([
      'vf0',
      'vf1',
      'vf2',
    ]);
  });

  it('should compute correct globalIndex across groups', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        position: 0,
        fields: [
          makeField({ position: 0, viewFieldId: 'vf1' }),
          makeField({ position: 1, viewFieldId: 'vf2' }),
        ],
      }),
      makeGroup({
        id: 'g2',
        position: 1,
        fields: [makeField({ position: 0, viewFieldId: 'vf3' })],
      }),
    ];

    const result = filterDraftGroupsForDisplay(groups);

    expect(result[0].fields[0].globalIndex).toBe(0);
    expect(result[0].fields[1].globalIndex).toBe(1);
    expect(result[1].fields[0].globalIndex).toBe(2);
  });

  it('should not count hidden fields in globalIndex', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        position: 0,
        fields: [
          makeField({ position: 0, isVisible: true, viewFieldId: 'vf1' }),
          makeField({ position: 1, isVisible: false, viewFieldId: 'vf2' }),
        ],
      }),
      makeGroup({
        id: 'g2',
        position: 1,
        fields: [
          makeField({ position: 0, isVisible: true, viewFieldId: 'vf3' }),
        ],
      }),
    ];

    const result = filterDraftGroupsForDisplay(groups);

    expect(result[0].fields).toHaveLength(1);
    expect(result[0].fields[0].globalIndex).toBe(0);
    expect(result[1].fields[0].globalIndex).toBe(1);
  });
});
