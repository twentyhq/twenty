import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useResolveOpenRecordIn } from '@/object-record/record-index/hooks/useResolveOpenRecordIn';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { act } from 'react';
import { ObjectOpenRecordIn, OpenRecordIn } from 'twenty-shared/types';

jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({
    useAtomFamilySelectorValue: jest.fn(),
  }),
);

const mockUseAtomFamilySelectorValue = jest.requireMock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
).useAtomFamilySelectorValue as jest.Mock;

const setObjectOpenRecordIn = (
  openRecordIn: ObjectOpenRecordIn | undefined,
) => {
  mockUseAtomFamilySelectorValue.mockImplementation(
    (_selector: unknown, { objectName }: { objectName: string }) =>
      objectName === 'company' && openRecordIn !== undefined
        ? { id: 'company-id', nameSingular: 'company', openRecordIn }
        : undefined,
  );
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const setMemberPreference = (openRecordIn: OpenRecordIn | undefined) => {
  act(() => {
    jotaiStore.set(
      currentWorkspaceMemberState.atom,
      openRecordIn === undefined
        ? null
        : ({ id: 'member-id', openRecordIn } as never),
    );
  });
};

describe('useResolveOpenRecordIn', () => {
  afterEach(() => {
    setMemberPreference(undefined);
  });

  it('follows the member preference when the object leaves the choice open', () => {
    setObjectOpenRecordIn(ObjectOpenRecordIn.USER_CHOICE);
    setMemberPreference(OpenRecordIn.RECORD_PAGE);

    const { result } = renderHook(() => useResolveOpenRecordIn('company'), {
      wrapper: Wrapper,
    });

    expect(result.current).toBe(OpenRecordIn.RECORD_PAGE);
  });

  it('lets the object pin its records over the member preference', () => {
    setObjectOpenRecordIn(ObjectOpenRecordIn.RECORD_PAGE);
    setMemberPreference(OpenRecordIn.SIDE_PANEL);

    const { result } = renderHook(() => useResolveOpenRecordIn('company'), {
      wrapper: Wrapper,
    });

    expect(result.current).toBe(OpenRecordIn.RECORD_PAGE);
  });

  it('falls back to the side panel default with no metadata and no member', () => {
    setObjectOpenRecordIn(undefined);

    const { result } = renderHook(() => useResolveOpenRecordIn('company'), {
      wrapper: Wrapper,
    });

    expect(result.current).toBe(OpenRecordIn.SIDE_PANEL);
  });
});
