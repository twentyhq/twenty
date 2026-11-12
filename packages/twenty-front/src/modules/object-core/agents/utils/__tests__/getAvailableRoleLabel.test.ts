import { getAvailableRoleLabel } from '@/object-core/agents/utils/getAvailableRoleLabel';

describe('getAvailableRoleLabel', () => {
  it.each([
    [[], 'Untitled agent Agent Role'],
    [['Untitled agent Agent Role'], 'Untitled agent Agent Role 2'],
    [
      ['Untitled agent Agent Role', 'Untitled agent Agent Role 2'],
      'Untitled agent Agent Role 3',
    ],
  ])(
    'picks a label no other role uses when %j are taken',
    (takenLabels, expectedLabel) => {
      expect(
        getAvailableRoleLabel({
          label: 'Untitled agent Agent Role',
          takenLabels,
        }),
      ).toBe(expectedLabel);
    },
  );
});
