import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { SidePanelCommandMenuItemDisplayPage } from '@/command-menu-item/display/components/SidePanelCommandMenuItemDisplayPage';
import { PageCommandEffect } from '@/command-menu-item/page-command/components/PageCommandEffect';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

const mockMountCommand = jest.fn();

jest.mock('@/command-menu-item/engine-command/hooks/useMountCommand', () => ({
  useMountCommand: () => mockMountCommand,
}));

jest.mock(
  '@/command-menu-item/engine-command/constants/EngineComponentKeyHeadlessComponentMap',
  () => ({ ENGINE_COMPONENT_KEY_COMPONENT_MAP: {} }),
);

jest.mock(
  '@/command-menu-item/engine-command/record/components/ExportRecordsCommand',
  () => ({ ExportRecordsCommand: () => null }),
);

const buildPageCommandMenuItem = ({
  engineComponentKey,
  label,
  position,
}: Pick<
  CommandMenuItemFieldsFragment,
  'engineComponentKey' | 'label' | 'position'
>): CommandMenuItemFieldsFragment => ({
  __typename: 'CommandMenuItem',
  id: `${engineComponentKey}-item`,
  engineComponentKey,
  label,
  shortLabel: label,
  icon: null,
  position,
  isPinned: true,
  isPinLocked: true,
  isActive: true,
  hotKeys: null,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
});

const COMMAND_MENU_ITEMS = [
  buildPageCommandMenuItem({
    engineComponentKey: EngineComponentKey.SAVE_PAGE,
    label: 'Save',
    position: 81,
  }),
  buildPageCommandMenuItem({
    engineComponentKey: EngineComponentKey.CANCEL_PAGE,
    label: 'Cancel',
    position: 82,
  }),
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <MockedProvider>
      <I18nProvider i18n={i18n}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/settings/objects']}>
            <ContextStoreComponentInstanceContext.Provider
              value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
            >
              <CommandMenuComponentInstanceContext.Provider
                value={{ instanceId: 'side-panel' }}
              >
                <CommandMenuContext.Provider
                  value={{
                    displayType: 'listItem',
                    containerType: CommandMenuItemContainerType.CommandMenuList,
                    commandMenuItems: COMMAND_MENU_ITEMS,
                    commandMenuContextApi: EMPTY_COMMAND_MENU_CONTEXT_API,
                    isInPreviewMode: false,
                  }}
                >
                  {children}
                </CommandMenuContext.Provider>
              </CommandMenuComponentInstanceContext.Provider>
            </ContextStoreComponentInstanceContext.Provider>
          </MemoryRouter>
        </ToastProvider>
      </I18nProvider>
    </MockedProvider>
  </JotaiProvider>
);

describe('SidePanelCommandMenuItemDisplayPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(focusStackState.atom, [
      {
        focusId: SIDE_PANEL_FOCUS_ID,
        componentInstance: {
          componentType: FocusComponentType.SIDE_PANEL,
          componentInstanceId: SIDE_PANEL_FOCUS_ID,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: true,
        },
      },
    ]);
  });

  it('leaves out page commands the page cannot run and runs the first live one on Enter', async () => {
    const user = userEvent.setup();

    render(
      <>
        <PageCommandEffect
          engineComponentKey={EngineComponentKey.SAVE_PAGE}
          onRun={jest.fn()}
          isDisabled
        />
        <PageCommandEffect
          engineComponentKey={EngineComponentKey.CANCEL_PAGE}
          onRun={jest.fn()}
        />
        <SidePanelCommandMenuItemDisplayPage />
      </>,
      { wrapper: Wrapper },
    );

    expect(await screen.findByText('Cancel')).toBeVisible();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();

    await user.keyboard('{Enter}');

    expect(mockMountCommand).toHaveBeenCalledTimes(1);
    expect(mockMountCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        engineComponentKey: EngineComponentKey.CANCEL_PAGE,
      }),
    );
  });

  it('keeps listing a page command while the page runs it', async () => {
    render(
      <>
        <PageCommandEffect
          engineComponentKey={EngineComponentKey.SAVE_PAGE}
          onRun={jest.fn()}
          isDisabled
          isLoading
        />
        <SidePanelCommandMenuItemDisplayPage />
      </>,
      { wrapper: Wrapper },
    );

    expect(await screen.findByText('Save')).toBeVisible();
  });
});
