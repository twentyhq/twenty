import { act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { useDebouncedSetAndPersistViewName } from '@/object-record/object-options-dropdown/hooks/useDebouncedSetAndPersistViewName';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

const DROPDOWN_ID = 'object-options-dropdown-id-test';

const mockUpdateCurrentView = jest.fn();

jest.mock('@/views/hooks/useUpdateCurrentView', () => ({
  useUpdateCurrentView: () => ({ updateCurrentView: mockUpdateCurrentView }),
}));

const renderUseDebouncedSetAndPersistViewName = () => {
  const store = createStore();

  store.set(focusStackState.atom, [
    {
      focusId: DROPDOWN_ID,
      componentInstance: {
        componentType: FocusComponentType.DROPDOWN,
        componentInstanceId: DROPDOWN_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: false,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    },
  ]);

  return renderHook(
    () => useDebouncedSetAndPersistViewName({ focusId: DROPDOWN_ID }),
    {
      wrapper: ({ children }) => (
        <JotaiProvider store={store}>
          <ViewComponentInstanceContext.Provider
            value={{ instanceId: 'record-index-id' }}
          >
            {children}
          </ViewComponentInstanceContext.Provider>
        </JotaiProvider>
      ),
    },
  );
};

describe('useDebouncedSetAndPersistViewName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('waits for the debounce before persisting the name', () => {
    const { result } = renderUseDebouncedSetAndPersistViewName();

    act(() => {
      result.current.debouncedSetAndPersistViewName('Renamed view');
    });

    expect(mockUpdateCurrentView).not.toHaveBeenCalled();
  });

  it('persists the pending name right away on Enter', async () => {
    const user = userEvent.setup();
    const { result } = renderUseDebouncedSetAndPersistViewName();

    act(() => {
      result.current.debouncedSetAndPersistViewName('Renamed view');
    });
    await user.keyboard('{Enter}');

    expect(mockUpdateCurrentView).toHaveBeenCalledTimes(1);
    expect(mockUpdateCurrentView).toHaveBeenCalledWith({
      name: 'Renamed view',
    });
  });

  it('persists the pending name when the dropdown closes before the debounce', () => {
    const { result, unmount } = renderUseDebouncedSetAndPersistViewName();

    act(() => {
      result.current.debouncedSetAndPersistViewName('Renamed view');
    });
    act(() => {
      unmount();
    });

    expect(mockUpdateCurrentView).toHaveBeenCalledTimes(1);
    expect(mockUpdateCurrentView).toHaveBeenCalledWith({
      name: 'Renamed view',
    });
  });

  it('sends nothing on Enter when no rename is pending', async () => {
    const user = userEvent.setup();
    renderUseDebouncedSetAndPersistViewName();

    await user.keyboard('{Enter}');

    expect(mockUpdateCurrentView).not.toHaveBeenCalled();
  });
});
