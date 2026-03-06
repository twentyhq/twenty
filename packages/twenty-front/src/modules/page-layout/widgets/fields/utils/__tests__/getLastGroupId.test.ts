import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { getLastGroupId } from '@/page-layout/widgets/fields/utils/getLastGroupId';

const makeGroup = (
  overrides: Partial<FieldsWidgetGroup> & { id: string },
): FieldsWidgetGroup => ({
  name: 'Group',
  position: 0,
  isVisible: true,
  fields: [],
  ...overrides,
});

describe('getLastGroupId', () => {
  it('should return null for empty array', () => {
    expect(getLastGroupId([])).toBeNull();
  });

  it('should return the id of a single group', () => {
    const groups = [makeGroup({ id: 'g1', position: 0 })];

    expect(getLastGroupId(groups)).toBe('g1');
  });

  it('should return the id of the group with the highest position', () => {
    const groups = [
      makeGroup({ id: 'g1', position: 0 }),
      makeGroup({ id: 'g2', position: 2 }),
      makeGroup({ id: 'g3', position: 1 }),
    ];

    expect(getLastGroupId(groups)).toBe('g2');
  });

  it('should not mutate the original array', () => {
    const groups = [
      makeGroup({ id: 'g2', position: 2 }),
      makeGroup({ id: 'g1', position: 0 }),
    ];

    getLastGroupId(groups);

    expect(groups[0].id).toBe('g2');
    expect(groups[1].id).toBe('g1');
  });
});
