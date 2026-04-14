import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import {
  currentWorkspaceMemberState,
  type CurrentWorkspaceMember,
} from '@/auth/states/currentWorkspaceMemberState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { resetJotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const updateOneRecordMock = jest.fn();

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({
    updateOneRecord: updateOneRecordMock,
  }),
}));

const workspaceMember: CurrentWorkspaceMember = {
  id: 'id',
  name: {
    firstName: 'firstName',
    lastName: 'lastName',
  },
  locale: 'en',
  colorScheme: 'System',
  userEmail: 'userEmail',
};

describe('useColorScheme', () => {
  it('should update color scheme', async () => {
    const store = resetJotaiStore();
    store.set(currentWorkspaceMemberState.atom, workspaceMember);

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    );

    const { result } = renderHook(
      () => {
        const colorScheme = useColorScheme();
        return colorScheme;
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.colorScheme).toBe('System');

    await act(async () => {
      await result.current.setColorScheme('Dark');
    });

    expect(result.current.colorScheme).toEqual('Dark');
  });
});
