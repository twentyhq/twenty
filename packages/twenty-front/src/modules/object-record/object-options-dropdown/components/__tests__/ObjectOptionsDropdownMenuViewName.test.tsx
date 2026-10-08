import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { ObjectOptionsDropdownMenuViewName } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownMenuViewName';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type View } from '@/views/types/View';

const DROPDOWN_ID = 'object-options-dropdown-id-test';

const mockUpdateCurrentView = jest.fn();
const mockPerformViewApiUpdate = jest.fn();

jest.mock(
  '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown',
  () => ({
    useObjectOptionsDropdown: () => ({ dropdownId: DROPDOWN_ID }),
  }),
);
jest.mock('@/views/hooks/useUpdateCurrentView', () => ({
  useUpdateCurrentView: () => ({ updateCurrentView: mockUpdateCurrentView }),
}));
jest.mock('@/views/hooks/internal/usePerformViewApiUpdate', () => ({
  usePerformViewApiUpdate: () => ({
    performViewApiUpdate: mockPerformViewApiUpdate,
  }),
}));
jest.mock('@/views/hooks/useCanPersistViewChanges', () => ({
  useCanPersistViewChanges: () => ({ canPersistChanges: true }),
}));
jest.mock('@/ui/input/components/IconPicker', () => ({
  IconPicker: () => null,
}));

const customView = {
  id: 'view-id',
  name: 'My view',
  icon: 'IconTable',
  key: null,
} as unknown as View;

const renderViewName = () => {
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

  return render(
    <JotaiProvider store={store}>
      <ViewComponentInstanceContext.Provider
        value={{ instanceId: 'record-index-id' }}
      >
        <ObjectOptionsDropdownMenuViewName currentView={customView} />
      </ViewComponentInstanceContext.Provider>
    </JotaiProvider>,
  );
};

describe('ObjectOptionsDropdownMenuViewName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves the typed name right away on Enter, without an update for an empty view', async () => {
    const user = userEvent.setup();
    renderViewName();

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Renamed view{Enter}');

    expect(mockPerformViewApiUpdate).not.toHaveBeenCalled();
    expect(mockUpdateCurrentView).toHaveBeenCalledTimes(1);
    expect(mockUpdateCurrentView).toHaveBeenCalledWith({
      name: 'Renamed view',
    });
  });

  it('saves the typed name when the dropdown closes before the debounce', async () => {
    const user = userEvent.setup();
    const { unmount } = renderViewName();

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Renamed view');

    expect(mockUpdateCurrentView).not.toHaveBeenCalled();

    act(() => {
      unmount();
    });

    expect(mockUpdateCurrentView).toHaveBeenCalledTimes(1);
    expect(mockUpdateCurrentView).toHaveBeenCalledWith({
      name: 'Renamed view',
    });
  });
});
