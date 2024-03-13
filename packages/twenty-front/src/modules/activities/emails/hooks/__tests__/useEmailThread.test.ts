import { act, renderHook } from '@testing-library/react';

import { useEmailThread } from '../useEmailThread';

const mockSetViewableEmailThreadId = jest.fn();
const mockUseOpenEmailThreadRightDrawer = jest.fn();

jest.mock('recoil', () => ({
  useSetRecoilState: () => mockSetViewableEmailThreadId,
}));

jest.mock(
  '@/activities/emails/right-drawer/hooks/useOpenEmailThreadRightDrawer',
  () => ({
    useOpenEmailThreadRightDrawer: () => mockUseOpenEmailThreadRightDrawer,
  }),
);

jest.mock('@/activities/emails/state/viewableEmailThreadIdState', () => ({
  viewableEmailThreadIdState: () => 'mockViewableEmailThreadIdState',
}));

describe('useEmailThread hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('openEmailThread function', () => {
    const { result } = renderHook(() => useEmailThread());

    act(() => {
      result.current.openEmailThread('mockThreadId');
    });

    expect(mockSetViewableEmailThreadId).toHaveBeenCalledWith('mockThreadId');
    expect(mockUseOpenEmailThreadRightDrawer).toHaveBeenCalled();
  });
});
