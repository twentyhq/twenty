import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode, useContext } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { WorkspaceSurfaceHeaderPortalContext } from '@/ui/layout/contexts/WorkspaceSurfaceHeaderPortalContext';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

jest.mock(
  '@/command-menu-item/display/components/PinnedCommandMenuItemButtons',
  () => ({
    PinnedCommandMenuItemButtons: () => {
      const { commandMenuItems } = useContext(CommandMenuContext);

      return commandMenuItems
        .filter((item) => item.isPinned === true)
        .map((item) => <button key={item.id}>{item.label}</button>);
    },
  }),
);

jest.mock('@/side-panel/components/SidePanelPageTitleSyncEffect', () => ({
  SidePanelPageTitleSyncEffect: () => null,
}));

jest.mock('@/ui/layout/page/components/PageCardLayout', () => ({
  PageCardLayout: ({
    header,
    children,
  }: {
    header: ReactNode;
    children: ReactNode;
  }) => (
    <>
      {header}
      {children}
    </>
  ),
}));

const ASK_AI_COMMAND_MENU_ITEM = {
  id: 'ask-ai',
  label: 'Ask AI',
  position: 43,
  isActive: true,
  isPinned: true,
  engineComponentKey: EngineComponentKey.ASK_AI,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  conditionalAvailabilityExpression:
    'permissionFlags.AI and not isInSidePanel and objectMetadataItem.nameSingular != "agentChatThread"',
  frontComponentId: null,
};

const SidePanelHeaderActions = ({ children }: { children: ReactNode }) => {
  const actionsContainer = document.createElement('div');

  document.body.appendChild(actionsContainer);

  return (
    <WorkspaceSurfaceContext.Provider
      value={{
        type: 'side-panel',
        instanceId: 'side-panel',
        ownsRouteLocation: false,
      }}
    >
      <WorkspaceSurfaceHeaderPortalContext.Provider
        value={{ title: null, actions: actionsContainer }}
      >
        {children}
      </WorkspaceSurfaceHeaderPortalContext.Provider>
    </WorkspaceSurfaceContext.Provider>
  );
};

const renderSettingsPageLayout = ({
  isCustomizableSidebarEnabled,
  isInSidePanel = false,
}: {
  isCustomizableSidebarEnabled: boolean;
  isInSidePanel?: boolean;
}) => {
  const store = createStore();

  store.set(currentWorkspaceState.atom, {
    featureFlags: [
      {
        key: FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
        value: isCustomizableSidebarEnabled,
      },
    ],
  } as never);
  store.set(currentUserWorkspaceState.atom, {
    permissionFlags: [PermissionFlagType.AI],
  } as never);
  store.set(metadataStoreState.atomFamily('commandMenuItems'), {
    current: [ASK_AI_COMMAND_MENU_ITEM],
    draft: [],
    status: 'up-to-date',
  });

  const layout = (
    <SettingsPageLayout
      links={[{ children: 'Settings' }]}
      title="General"
      actionButton={<button>Save</button>}
    >
      Content
    </SettingsPageLayout>
  );

  return render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter initialEntries={['/settings/general']}>
        <JotaiProvider store={store}>
          {isInSidePanel ? (
            <SidePanelHeaderActions>{layout}</SidePanelHeaderActions>
          ) : (
            layout
          )}
        </JotaiProvider>
      </MemoryRouter>
    </I18nProvider>,
  );
};

describe('SettingsPageLayout', () => {
  it('should show pinned global commands after the page actions when the flag is on', () => {
    renderSettingsPageLayout({ isCustomizableSidebarEnabled: true });

    const buttonNames = screen
      .getAllByRole('button')
      .map((button) => button.textContent);

    expect(buttonNames).toEqual(['Save', 'Ask AI']);
  });

  it('should only show the page actions when the flag is off', () => {
    renderSettingsPageLayout({ isCustomizableSidebarEnabled: false });

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ask AI' }),
    ).not.toBeInTheDocument();
  });

  it('should not show Ask AI when the settings page is rendered in the side panel', () => {
    renderSettingsPageLayout({
      isCustomizableSidebarEnabled: true,
      isInSidePanel: true,
    });

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Ask AI' }),
    ).not.toBeInTheDocument();
  });
});
