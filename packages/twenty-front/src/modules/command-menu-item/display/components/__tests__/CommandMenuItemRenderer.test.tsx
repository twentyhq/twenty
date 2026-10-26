import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { PageCommandEffect } from '@/command-menu-item/page-command/components/PageCommandEffect';
import { PageCommandLinkEffect } from '@/command-menu-item/page-command/components/PageCommandLinkEffect';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
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

jest.mock('@/side-panel/hooks/useOpenFrontComponentInSidePanel', () => ({
  useOpenFrontComponentInSidePanel: () => ({
    openFrontComponentInSidePanel: jest.fn(),
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));

jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: () => ({ closeDropdown: jest.fn() }),
}));

const buildPageCommandMenuItem = ({
  engineComponentKey,
  label,
}: {
  engineComponentKey: EngineComponentKey;
  label: string;
}): CommandMenuItemDefinition => ({
  __typename: 'CommandMenuItem',
  id: `${engineComponentKey}-item`,
  engineComponentKey,
  label,
  shortLabel: label,
  icon: null,
  position: 0,
  isPinned: true,
  isPinLocked: false,
  isActive: true,
  hotKeys: null,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
});

const CurrentPathname = () => (
  <div data-testid="pathname">{useLocation().pathname}</div>
);

const renderSettingsPageHeader = (page: ReactNode) =>
  render(
    <JotaiProvider store={createStore()}>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
      >
        <CommandMenuComponentInstanceContext.Provider
          value={{ instanceId: 'settings-page-header' }}
        >
          <CommandMenuContext.Provider
            value={{
              displayType: 'button',
              containerType: CommandMenuItemContainerType.IndexPageHeader,
              commandMenuItems: [],
              commandMenuContextApi: EMPTY_COMMAND_MENU_CONTEXT_API,
              isInPreviewMode: false,
            }}
          >
            <MemoryRouter initialEntries={['/settings/objects/companies']}>
              <Routes>
                <Route
                  path="/settings/objects/:objectNamePlural"
                  element={page}
                />
                <Route path="*" element={null} />
              </Routes>
              <CurrentPathname />
            </MemoryRouter>
          </CommandMenuContext.Provider>
        </CommandMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </JotaiProvider>,
  );

const NEW_FIELD_ITEM = buildPageCommandMenuItem({
  engineComponentKey: EngineComponentKey.CREATE_DATA_MODEL_FIELD,
  label: 'New Field',
});

describe('CommandMenuItemRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      description: 'keeps its label while the page is busy',
      engineComponentKey: EngineComponentKey.SAVE_PAGE,
      label: 'Save',
      isLoading: true,
      progress: undefined,
      expectedText: 'Save',
      isBusy: true,
    },
    {
      description: 'shows the progress the page reports',
      engineComponentKey: EngineComponentKey.INSTALL_APPLICATION,
      label: 'Install',
      isLoading: false,
      progress: 40,
      expectedText: '40%',
      isBusy: false,
    },
  ])(
    'a page command $description',
    ({
      engineComponentKey,
      label,
      isLoading,
      progress,
      expectedText,
      isBusy,
    }) => {
      renderSettingsPageHeader(
        <>
          <PageCommandEffect
            engineComponentKey={engineComponentKey}
            onRun={jest.fn()}
            isLoading={isLoading}
            isDisabled
            progress={progress}
          />
          <CommandMenuItemRenderer
            item={buildPageCommandMenuItem({ engineComponentKey, label })}
          />
        </>,
      );

      const button = screen.getByRole('button', { name: label });

      expect(button).toBeDisabled();
      expect(button).toHaveTextContent(expectedText);
      expect(button.getAttribute('aria-busy') === 'true').toBe(isBusy);
    },
  );

  it('renders a link page command as a link to the path resolved from its page', async () => {
    const user = userEvent.setup();

    renderSettingsPageHeader(
      <>
        <PageCommandLinkEffect
          engineComponentKey={EngineComponentKey.CREATE_DATA_MODEL_FIELD}
          to="./new-field/select"
        />
        <CommandMenuItemRenderer item={NEW_FIELD_ITEM} />
      </>,
    );

    const link = screen.getByRole('link', { name: 'New Field' });

    expect(link).toHaveAttribute(
      'href',
      '/settings/objects/companies/new-field/select',
    );

    await user.click(link);

    expect(screen.getByTestId('pathname')).toHaveTextContent(
      '/settings/objects/companies/new-field/select',
    );
    expect(mockMountCommand).not.toHaveBeenCalled();
  });

  it('renders a disabled link page command as a disabled button', () => {
    renderSettingsPageHeader(
      <>
        <PageCommandLinkEffect
          engineComponentKey={EngineComponentKey.CREATE_DATA_MODEL_FIELD}
          to="./new-field/select"
          isDisabled
        />
        <CommandMenuItemRenderer item={NEW_FIELD_ITEM} />
      </>,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New Field' })).toBeDisabled();
  });
});
