import { renderHook } from '@testing-library/react';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { useChatThreadTitle } from '@/activities/emails/hooks/useChatThreadTitle';

const mockUseEmailThread = jest.fn();

jest.mock('@/activities/emails/hooks/useEmailThread', () => ({
  useEmailThread: () => mockUseEmailThread(),
}));

jest.mock('@/activities/emails/hooks/useChatThreadCounterparts', () => ({
  useChatThreadCounterparts: () => [{ displayName: 'Sundar Pichai' }],
}));

const mockMessageSubjects = (subjects: string[]) =>
  mockUseEmailThread.mockReturnValue({
    messages: subjects.map((subject) => ({ subject })),
  });

describe('useChatThreadTitle', () => {
  it('should use the latest conversation name', () => {
    mockMessageSubjects(['Old family group', 'Family group', '']);

    const { result } = renderHook(() => useChatThreadTitle('thread-id'));

    expect(result.current).toBe('Family group');
  });

  it('should skip restricted subjects', () => {
    mockMessageSubjects([
      'Family group',
      FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
    ]);

    const { result } = renderHook(() => useChatThreadTitle('thread-id'));

    expect(result.current).toBe('Family group');
  });

  it('should fall back to counterpart names', () => {
    mockMessageSubjects([FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED]);

    const { result } = renderHook(() => useChatThreadTitle('thread-id'));

    expect(result.current).toBe('Sundar Pichai');
  });
});
