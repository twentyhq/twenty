import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { getHiddenFieldsFromGroups } from '@/page-layout/widgets/fields/utils/getHiddenFieldsFromGroups';

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

describe('getHiddenFieldsFromGroups', () => {
  it('should return empty array for empty input', () => {
    const result = getHiddenFieldsFromGroups([]);

    expect(result).toEqual([]);
  });

  it('should return empty array when all fields are visible in visible groups', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        isVisible: true,
        fields: [
          makeField({ isVisible: true, viewFieldId: 'vf1' }),
          makeField({ isVisible: true, viewFieldId: 'vf2' }),
        ],
      }),
    ];

    const result = getHiddenFieldsFromGroups(groups);

    expect(result).toEqual([]);
  });

  it('should collect hidden fields from visible groups', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        isVisible: true,
        fields: [
          makeField({ isVisible: true, viewFieldId: 'vf1' }),
          makeField({ isVisible: false, viewFieldId: 'vf2' }),
          makeField({ isVisible: true, viewFieldId: 'vf3' }),
        ],
      }),
    ];

    const result = getHiddenFieldsFromGroups(groups);

    expect(result).toHaveLength(1);
    expect(result[0].viewFieldId).toBe('vf2');
    expect(result[0].isVisible).toBe(false);
  });

  it('should collect all fields from hidden groups', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        isVisible: false,
        fields: [
          makeField({ isVisible: true, viewFieldId: 'vf1' }),
          makeField({ isVisible: true, viewFieldId: 'vf2' }),
        ],
      }),
    ];

    const result = getHiddenFieldsFromGroups(groups);

    expect(result).toHaveLength(2);
    expect(result[0].isVisible).toBe(false);
    expect(result[1].isVisible).toBe(false);
  });

  it('should sort groups by position', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g2',
        position: 1,
        isVisible: false,
        fields: [makeField({ viewFieldId: 'vf2' })],
      }),
      makeGroup({
        id: 'g1',
        position: 0,
        isVisible: false,
        fields: [makeField({ viewFieldId: 'vf1' })],
      }),
    ];

    const result = getHiddenFieldsFromGroups(groups);

    expect(result[0].viewFieldId).toBe('vf1');
    expect(result[1].viewFieldId).toBe('vf2');
  });

  it('should sort fields by position within each group', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        isVisible: false,
        fields: [
          makeField({ position: 2, viewFieldId: 'vf2' }),
          makeField({ position: 0, viewFieldId: 'vf0' }),
          makeField({ position: 1, viewFieldId: 'vf1' }),
        ],
      }),
    ];

    const result = getHiddenFieldsFromGroups(groups);

    expect(result.map((f) => f.viewFieldId)).toEqual(['vf0', 'vf1', 'vf2']);
  });

  it('should compute correct globalIndex across groups', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        position: 0,
        isVisible: false,
        fields: [
          makeField({ position: 0, viewFieldId: 'vf1' }),
          makeField({ position: 1, viewFieldId: 'vf2' }),
        ],
      }),
      makeGroup({
        id: 'g2',
        position: 1,
        isVisible: false,
        fields: [makeField({ position: 0, viewFieldId: 'vf3' })],
      }),
    ];

    const result = getHiddenFieldsFromGroups(groups);

    expect(result[0].globalIndex).toBe(0);
    expect(result[1].globalIndex).toBe(1);
    expect(result[2].globalIndex).toBe(2);
  });

  it('should not count visible fields in globalIndex', () => {
    const groups: FieldsWidgetGroup[] = [
      makeGroup({
        id: 'g1',
        position: 0,
        isVisible: true,
        fields: [
          makeField({ position: 0, isVisible: true, viewFieldId: 'vf1' }),
          makeField({ position: 1, isVisible: false, viewFieldId: 'vf2' }),
        ],
      }),
      makeGroup({
        id: 'g2',
        position: 1,
        isVisible: true,
        fields: [
          makeField({ position: 0, isVisible: false, viewFieldId: 'vf3' }),
        ],
      }),
    ];

    const result = getHiddenFieldsFromGroups(groups);

    expect(result).toHaveLength(2);
    expect(result[0].globalIndex).toBe(0);
    expect(result[0].viewFieldId).toBe('vf2');
    expect(result[1].globalIndex).toBe(1);
    expect(result[1].viewFieldId).toBe('vf3');
  });
});
