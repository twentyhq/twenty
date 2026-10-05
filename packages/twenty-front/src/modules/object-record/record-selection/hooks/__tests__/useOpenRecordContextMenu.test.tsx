import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useOpenRecordContextMenu } from '@/object-record/record-selection/hooks/useOpenRecordContextMenu';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const instanceId = 'record-index-id';
const commandMenuInstanceId = 'command-menu-id';
const recordId = 'record-1';

const isRecordSelectedAtom = isRecordSelectedComponentFamilyState.atomFamily({
  instanceId,
  familyKey: recordId,
});

const mockOpenDropdown = jest.fn();
// Closing the side panel in layout customization mode resets the selection
const mockCloseSidePanelMenu = jest.fn(() =>
  jotaiStore.set(isRecordSelectedAtom, false),
);

jest.mock('@/ui/layout/dropdown/hooks/useOpenDropdown', () => ({
  useOpenDropdown: () => ({ openDropdown: mockOpenDropdown }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockCloseSidePanelMenu }),
}));

jest.mock('@/ui/layout/hooks/useWorkspaceSurface', () => ({
  useWorkspaceSurface: () => ({ type: 'main' }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <RecordSelectionComponentInstanceContext.Provider value={{ instanceId }}>
      <CommandMenuComponentInstanceContext.Provider
        value={{ instanceId: commandMenuInstanceId }}
      >
        {children}
      </CommandMenuComponentInstanceContext.Provider>
    </RecordSelectionComponentInstanceContext.Provider>
  </JotaiProvider>
);

describe('useOpenRecordContextMenu', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
  });

  it('should keep the right-clicked record selected once the side panel has closed', () => {
    const { result } = renderHook(() => useOpenRecordContextMenu(), {
      wrapper: Wrapper,
    });
    const preventDefault = jest.fn();

    act(() => {
      result.current.openRecordContextMenu({
        event: { preventDefault, clientX: 10, clientY: 20 },
        recordId,
      });
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(mockCloseSidePanelMenu).toHaveBeenCalled();
    expect(jotaiStore.get(isRecordSelectedAtom)).toBe(true);
    expect(mockOpenDropdown).toHaveBeenCalledWith(
      expect.objectContaining({
        dropdownComponentInstanceIdFromProps:
          getCommandMenuDropdownIdFromCommandMenuId(commandMenuInstanceId),
      }),
    );
  });
});
