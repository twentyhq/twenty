import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { createElement } from 'react';

import { RecordPageSidePanelCommandMenuDropdown } from '@/command-menu-item/components/RecordPageSidePanelCommandMenuDropdown';
import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { ExportRecordsCommand } from '@/command-menu-item/engine-command/record/components/ExportRecordsCommand';
import { createMockCommandMenuItems } from '@/command-menu-item/mock/command-menu-items.mock';
import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { EngineComponentKey } from '~/generated-metadata/graphql';

const mockMountCommand = jest.fn();
let mockIsCommandMounted = false;

jest.mock('@/command-menu-item/engine-command/hooks/useMountCommand', () => ({
  useMountCommand: () => mockMountCommand,
}));

jest.mock(
  '@/command-menu-item/engine-command/record/components/ExportRecordsCommand',
  () => ({
    ExportRecordsCommand: () => null,
  }),
);

jest.mock(
  '@/command-menu-item/engine-command/constants/EngineComponentKeyHeadlessComponentMap',
  () => ({
    get ENGINE_COMPONENT_KEY_COMPONENT_MAP() {
      return {
        [EngineComponentKey.EXPORT_FROM_RECORD_INDEX]:
          createElement(ExportRecordsCommand),
      };
    },
  }),
);

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => true,
}));

jest.mock('@/applications/hooks/useIsThirdPartyApplication', () => ({
  useIsThirdPartyApplication: () => false,
}));

jest.mock('@/applications/hooks/useApplicationChipData', () => ({
  useApplicationChipData: () => ({ applicationChipData: { name: '' } }),
}));

jest.mock('@/side-panel/hooks/useOpenFrontComponentInSidePanel', () => ({
  useOpenFrontComponentInSidePanel: () => ({
    openFrontComponentInSidePanel: jest.fn(),
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({
    useAvailableComponentInstanceIdOrThrow: () => 'side-panel-record',
  }),
);

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({
    useAtomFamilySelectorValue: () => mockIsCommandMounted,
  }),
);

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue', () => ({
  useAtomFamilyStateValue: () => 37,
}));

const renderCommandMenu = () => {
  const store = createStore();
  const content = (
    <I18nProvider i18n={i18n}>
      <Provider store={store}>
        <CommandMenuContext.Provider
          value={{
            containerType:
              CommandMenuItemContainerType.CommandMenuShowPageDropdown,
            displayType: 'dropdownItem',
            commandMenuItems: createMockCommandMenuItems().map((item) => ({
              ...item,
              isPinned: false,
            })),
            commandMenuContextApi: {
              ...EMPTY_COMMAND_MENU_CONTEXT_API,
              isInSidePanel: true,
            },
            isInPreviewMode: false,
          }}
        >
          <RecordPageSidePanelCommandMenuDropdown />
        </CommandMenuContext.Provider>
      </Provider>
    </I18nProvider>
  );
  render(content);
  return {
    user: userEvent.setup(),
    store,
  };
};

describe('RecordPageSidePanelCommandMenuDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsCommandMounted = false;
  });

  it('closes ordinary commands through the application state and excludes global commands', async () => {
    const { user, store } = renderCommandMenu();
    await user.click(screen.getByRole('button', { name: 'Options' }));
    expect(
      screen.queryByRole('menuitem', { name: 'Go to People' }),
    ).not.toBeInTheDocument();
    await user.click(
      await screen.findByRole('menuitem', { name: 'Add to favorites' }),
    );

    expect(mockMountCommand).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(
      store.get(
        isDropdownOpenComponentState.atomFamily({
          instanceId:
            getSidePanelCommandMenuDropdownIdFromCommandMenuId(
              'side-panel-record',
            ),
        }),
      ),
    ).toBe(false);
  });

  it('keeps asynchronous export open while starting the command', async () => {
    const { user, store } = renderCommandMenu();
    await user.click(screen.getByRole('button', { name: 'Options' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Export' }));

    expect(mockMountCommand).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('menu')).toBeVisible();
    expect(
      store.get(
        isDropdownOpenComponentState.atomFamily({
          instanceId:
            getSidePanelCommandMenuDropdownIdFromCommandMenuId(
              'side-panel-record',
            ),
        }),
      ),
    ).toBe(true);
  });

  it('shows progress and prevents a mounted command from running again', async () => {
    mockIsCommandMounted = true;
    const { user } = renderCommandMenu();
    await user.click(screen.getByRole('button', { name: 'Options' }));
    const exportAction = await screen.findByRole('menuitem', {
      name: /Export 37%/,
    });
    expect(exportAction).toHaveAttribute('aria-disabled', 'true');
    await user.click(exportAction);

    expect(mockMountCommand).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeVisible();
  });
});
