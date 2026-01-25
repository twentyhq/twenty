import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useNotes } from '@/activities/notes/hooks/useNotes';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

vi.mock('@/activities/hooks/useActivities', () => ({
  useActivities: vi.fn(() => ({
    activities: [{ id: '1', content: 'Example Note' }],
    loading: false,
  })),
}));

vi.mock('recoil', async () => {
  const actualRecoil = await vi.importActual('recoil');
  return {
    ...actualRecoil,
    useRecoilState: vi.fn(() => {
      const mockCurrentNotesQueryVariables = {
        filter: {},
        orderBy: 'mockOrderBy',
      };
      return [mockCurrentNotesQueryVariables, vi.fn()];
    }),
    atom: vi.fn(),
  };
});

describe('useNotes', () => {
  it('should return notes, and loading as expected', () => {
    const mockTargetableObject: ActivityTargetableObject = {
      id: '1',
      targetObjectNameSingular: 'Example Target',
    };
    const { result } = renderHook(() => useNotes(mockTargetableObject));

    expect(result.current.notes).toEqual([
      { id: '1', content: 'Example Note' },
    ]);
    expect(result.current.loading).toBe(false);
  });
});
