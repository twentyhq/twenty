import { renderHook } from '@testing-library/react';

import { useNotes } from '@/activities/notes/hooks/useNotes';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

jest.mock('@/activities/hooks/useActivities', () => ({
  useActivities: jest.fn(() => ({
    activities: [{ id: '1', content: 'Example Note', __typename: 'Note' }],
    fetchMoreActivities: jest.fn(),
    isFetchingMoreActivities: false,
    hasNextPage: false,
  })),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomState', () => ({
  useAtomState: jest.fn(() => {
    const mockCurrentNotesQueryVariables = {
      filter: {},
      orderBy: 'mockOrderBy',
    };
    return [mockCurrentNotesQueryVariables, jest.fn()];
  }),
}));

describe('useNotes', () => {
  it('should return notes filtered by typename', () => {
    const mockTargetableObject: ActivityTargetableObject = {
      id: '1',
      targetObjectNameSingular: 'Example Target',
    };
    const { result } = renderHook(() => useNotes(mockTargetableObject));

    expect(result.current.notes).toEqual([
      { id: '1', content: 'Example Note', __typename: 'Note' },
    ]);
    expect(result.current.isFetchingMoreNotes).toBe(false);
  });
});
