import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { sortRecordGroupDefinitions } from '@/object-record/record-group/utils/sortRecordGroupDefinitions';

const createGroup = (
  overrides: Partial<{
    id: string;
    title: string;
    position: number;
    isVisible: boolean;
  }>,
) => ({
  id: overrides.id ?? '1',
  type: RecordGroupDefinitionType.Value,
  title: overrides.title ?? 'Group',
  value: 'value',
  color: 'green' as const,
  position: overrides.position ?? 0,
  isVisible: overrides.isVisible ?? true,
});

describe('sortRecordGroupDefinitions', () => {
  const groups = [
    createGroup({ id: '1', title: 'Charlie', position: 2 }),
    createGroup({ id: '2', title: 'Alpha', position: 0 }),
    createGroup({ id: '3', title: 'Bravo', position: 1 }),
  ];

  it('should sort alphabetically', () => {
    const result = sortRecordGroupDefinitions(
      groups,
      RecordGroupSort.Alphabetical,
    );

    expect(result.map((g) => g.title)).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('should sort reverse alphabetically', () => {
    const result = sortRecordGroupDefinitions(
      groups,
      RecordGroupSort.ReverseAlphabetical,
    );

    expect(result.map((g) => g.title)).toEqual(['Charlie', 'Bravo', 'Alpha']);
  });

  it('should sort by position for Manual sort', () => {
    const result = sortRecordGroupDefinitions(groups, RecordGroupSort.Manual);

    expect(result.map((g) => g.title)).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('should filter out hidden groups', () => {
    const groupsWithHidden = [
      ...groups,
      createGroup({ id: '4', title: 'Delta', position: 3, isVisible: false }),
    ];

    const result = sortRecordGroupDefinitions(
      groupsWithHidden,
      RecordGroupSort.Manual,
    );

    expect(result).toHaveLength(3);
    expect(result.find((g) => g.title === 'Delta')).toBeUndefined();
  });
});
