import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import {
  currentWorkspaceMemberState,
  type CurrentWorkspaceMember,
} from '@/auth/states/currentWorkspaceMemberState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { resetJotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const mockUpdateWorkspaceMemberSettings = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [mockUpdateWorkspaceMemberSettings],
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
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

const renderColorSchemeHook = () => {
  const store = resetJotaiStore();
  store.set(currentWorkspaceMemberState.atom, workspaceMember);
  store.set(persistedColorSchemeState.atom, 'System');

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

  return { store, ...renderHook(useColorScheme, { wrapper: Wrapper }) };
};

describe('useColorScheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateWorkspaceMemberSettings.mockResolvedValue({
      data: { updateWorkspaceMemberSettings: true },
    });
  });

  it('should update both color scheme preferences only after saving', async () => {
    const { result, store } = renderColorSchemeHook();

    await act(async () => {
      const update = result.current.setColorScheme('Dark');

      expect(store.get(currentWorkspaceMemberState.atom)?.colorScheme).toBe(
        'System',
      );
      expect(store.get(persistedColorSchemeState.atom)).toBe('System');

      await update;
    });

    expect(result.current.colorScheme).toBe('Dark');
    expect(store.get(persistedColorSchemeState.atom)).toBe('Dark');
    expect(mockUpdateWorkspaceMemberSettings).toHaveBeenCalledWith({
      variables: {
        input: {
          workspaceMemberId: workspaceMember.id,
          update: { colorScheme: 'Dark' },
        },
      },
    });
    expect(mockEnqueueErrorSnackBar).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    'should keep the saved theme and report a failure (unmounted: %s)',
    async (shouldUnmount) => {
      mockUpdateWorkspaceMemberSettings.mockRejectedValueOnce(
        new Error('Profile update failed'),
      );
      const { result, store, unmount } = renderColorSchemeHook();

      await act(async () => {
        const update = result.current.setColorScheme('Dark');

        if (shouldUnmount) {
          unmount();
        }

        await expect(update).resolves.toBeUndefined();
      });

      expect(store.get(currentWorkspaceMemberState.atom)?.colorScheme).toBe(
        'System',
      );
      expect(store.get(persistedColorSchemeState.atom)).toBe('System');
      expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
        message: 'Failed to update theme',
      });
    },
  );

  it('should not save a theme without a workspace member', async () => {
    const { result, store } = renderColorSchemeHook();

    act(() => {
      store.set(currentWorkspaceMemberState.atom, null);
    });
    await act(async () => {
      await result.current.setColorScheme('Dark');
    });

    expect(mockUpdateWorkspaceMemberSettings).not.toHaveBeenCalled();
    expect(store.get(persistedColorSchemeState.atom)).toBe('System');
  });
});
