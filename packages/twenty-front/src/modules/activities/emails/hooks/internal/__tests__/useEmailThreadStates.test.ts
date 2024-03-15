import { renderHook } from '@testing-library/react';

import { useEmailThreadStates } from '@/activities/emails/hooks/internal/useEmailThreadStates';

const mockScopeId = 'mockScopeId';
const mockGetEmailThreadsPageState = jest.fn();

jest.mock(
  '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId',
  () => ({
    useAvailableScopeIdOrThrow: () => mockScopeId,
  }),
);

jest.mock(
  '@/ui/utilities/state/component-state/utils/extractComponentState',
  () => ({
    extractComponentState: () => mockGetEmailThreadsPageState,
  }),
);

describe('useEmailThreadStates hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the correct scopeId and getEmailThreadsPageState', () => {
    const { result } = renderHook(() =>
      useEmailThreadStates({ emailThreadScopeId: 'mockEmailThreadScopeId' }),
    );

    expect(result.current.scopeId).toBe(mockScopeId);
    expect(result.current.getEmailThreadsPageState).toBe(
      mockGetEmailThreadsPageState,
    );
  });
});
