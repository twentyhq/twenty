import { fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { WorkspaceRouteObjectsContext } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { WorkspaceRoutes } from '@/app/routing/components/WorkspaceRoutes';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import {
  RoutedFlowStateScopeContext,
  useRoutedFlowStateScopeId,
} from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { updatedObjectNamePluralState } from '~/pages/settings/data-model/states/updatedObjectNamePluralState';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';

const ROLE_ID = 'role-1';
const MODAL_ID = 'role-modal';
const DROPDOWN_ID = 'role-dropdown';

const buildRole = (label: string): RoleWithPartialMembers => ({
  ...mockedRoles[0],
  id: ROLE_ID,
  label,
});

const ScopedStateProbe = ({
  name,
}: {
  name: 'main' | 'panel' | 'panel-second';
}) => {
  const modalId = useWorkspaceSurfaceScopedComponentInstanceId(MODAL_ID);
  const dropdownId = useWorkspaceSurfaceScopedComponentInstanceId(DROPDOWN_ID);
  const tableId = useWorkspaceSurfaceScopedComponentInstanceId('role-table');
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    ROLE_ID,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    ROLE_ID,
  );
  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    ROLE_ID,
  );
  const setSettingsPersistedRole = useSetAtomFamilyState(
    settingsPersistedRoleFamilyState,
    ROLE_ID,
  );
  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    modalId,
  );
  const { openModal, toggleModal } = useModal();
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { openDropdown } = useOpenDropdown();
  const sortedFieldByTable = useAtomFamilyStateValue(
    sortedFieldByTableFamilyState,
    { tableId },
  );
  const setSortedFieldByTable = useSetAtomFamilyState(
    sortedFieldByTableFamilyState,
    { tableId },
  );
  const updatedObjectNamePlural = useAtomStateValue(
    updatedObjectNamePluralState,
  );
  const setUpdatedObjectNamePlural = useSetAtomState(
    updatedObjectNamePluralState,
  );

  return (
    <section>
      <span data-testid={`${name}-draft`}>{settingsDraftRole.label}</span>
      <span data-testid={`${name}-persisted`}>
        {settingsPersistedRole?.label ?? 'unset'}
      </span>
      <span data-testid={`${name}-modal`}>{String(isModalOpened)}</span>
      <span data-testid={`${name}-dropdown`}>{String(isDropdownOpen)}</span>
      <span data-testid={`${name}-sort`}>
        {sortedFieldByTable?.fieldName ?? 'unset'}
      </span>
      <span data-testid={`${name}-object-name`}>
        {updatedObjectNamePlural || 'unset'}
      </span>
      <button
        onClick={() =>
          setSettingsDraftRole((role) => ({
            ...role,
            label: `${name}-draft`,
          }))
        }
      >
        {name} draft
      </button>
      <button onClick={() => openModal(MODAL_ID)}>{name} modal</button>
      <button onClick={() => toggleModal(MODAL_ID)}>{name} toggle modal</button>
      <button
        onClick={() =>
          openDropdown({ dropdownComponentInstanceIdFromProps: DROPDOWN_ID })
        }
      >
        {name} dropdown
      </button>
      <button
        onClick={() =>
          setSortedFieldByTable({
            fieldName: `${name}-field`,
            direction: 'asc',
          })
        }
      >
        {name} sort
      </button>
      <button onClick={() => setUpdatedObjectNamePlural(`${name}-object-name`)}>
        {name} object name
      </button>
      <button
        onClick={() =>
          setSettingsPersistedRole(buildRole('shared-persisted-role'))
        }
      >
        {name} persisted
      </button>
    </section>
  );
};

const ScopeIdProbe = () => {
  const scopeId = useRoutedFlowStateScopeId();

  return <span data-testid="scope-id">{scopeId ?? 'unscoped'}</span>;
};

describe('settings routed-flow state scope', () => {
  it('keeps drafts flow-local, UI state entry-local, and persisted entities global', () => {
    const store = createStore();
    store.set(
      settingsPersistedRoleFamilyState.atomFamily(ROLE_ID),
      buildRole('initial-persisted-role'),
    );

    render(
      <JotaiProvider store={store}>
        <WorkspaceSurfaceContext.Provider
          value={{
            type: 'main',
            instanceId: 'main',
            ownsRouteLocation: true,
          }}
        >
          <RoutedFlowStateScopeContext.Provider value={null}>
            <ScopedStateProbe name="main" />
          </RoutedFlowStateScopeContext.Provider>
        </WorkspaceSurfaceContext.Provider>
        <WorkspaceSurfaceContext.Provider
          value={{
            type: 'side-panel',
            instanceId: 'panel-page-1',
            routedFlowStateScopeId: 'panel-flow-1',
            ownsRouteLocation: true,
          }}
        >
          <RoutedFlowStateScopeContext.Provider value="panel-flow-1">
            <ScopedStateProbe name="panel" />
          </RoutedFlowStateScopeContext.Provider>
        </WorkspaceSurfaceContext.Provider>
        <WorkspaceSurfaceContext.Provider
          value={{
            type: 'side-panel',
            instanceId: 'panel-page-2',
            routedFlowStateScopeId: 'panel-flow-1',
            ownsRouteLocation: true,
          }}
        >
          <RoutedFlowStateScopeContext.Provider value="panel-flow-1">
            <ScopedStateProbe name="panel-second" />
          </RoutedFlowStateScopeContext.Provider>
        </WorkspaceSurfaceContext.Provider>
      </JotaiProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'main draft' }));
    fireEvent.click(screen.getByRole('button', { name: 'panel draft' }));
    fireEvent.click(screen.getByRole('button', { name: 'panel modal' }));
    fireEvent.click(screen.getByRole('button', { name: 'panel dropdown' }));
    fireEvent.click(screen.getByRole('button', { name: 'panel sort' }));
    fireEvent.click(screen.getByRole('button', { name: 'panel object name' }));

    expect(screen.getByTestId('main-draft')).toHaveTextContent('main-draft');
    expect(screen.getByTestId('panel-draft')).toHaveTextContent('panel-draft');
    expect(screen.getByTestId('panel-second-draft')).toHaveTextContent(
      'panel-draft',
    );
    expect(screen.getByTestId('panel-modal')).toHaveTextContent('true');
    expect(screen.getByTestId('main-modal')).toHaveTextContent('false');
    expect(screen.getByTestId('panel-second-modal')).toHaveTextContent('false');
    expect(screen.getByTestId('panel-dropdown')).toHaveTextContent('true');
    expect(screen.getByTestId('main-dropdown')).toHaveTextContent('false');
    expect(screen.getByTestId('panel-second-dropdown')).toHaveTextContent(
      'false',
    );
    expect(screen.getByTestId('panel-sort')).toHaveTextContent('panel-field');
    expect(screen.getByTestId('main-sort')).toHaveTextContent('unset');
    expect(screen.getByTestId('panel-second-sort')).toHaveTextContent('unset');
    expect(screen.getByTestId('panel-object-name')).toHaveTextContent(
      'panel-object-name',
    );
    expect(screen.getByTestId('panel-second-object-name')).toHaveTextContent(
      'panel-object-name',
    );
    expect(screen.getByTestId('main-object-name')).toHaveTextContent('unset');

    fireEvent.click(screen.getByRole('button', { name: 'panel toggle modal' }));
    expect(screen.getByTestId('panel-modal')).toHaveTextContent('false');
    expect(screen.getByTestId('main-modal')).toHaveTextContent('false');

    fireEvent.click(screen.getByRole('button', { name: 'panel persisted' }));

    expect(screen.getByTestId('panel-persisted')).toHaveTextContent(
      'shared-persisted-role',
    );
    expect(screen.getByTestId('main-persisted')).toHaveTextContent(
      'shared-persisted-role',
    );
    expect(screen.getByTestId('panel-second-persisted')).toHaveTextContent(
      'shared-persisted-role',
    );
    expect(screen.getByTestId('panel-draft')).toHaveTextContent('panel-draft');
    expect(screen.getByTestId('main-draft')).toHaveTextContent('main-draft');
  });

  it('uses the routed flow scope instead of the current stack-entry ID', () => {
    render(
      <JotaiProvider>
        <WorkspaceSurfaceContext.Provider
          value={{
            type: 'side-panel',
            instanceId: 'panel-page-42',
            routedFlowStateScopeId: 'panel-flow-7',
            ownsRouteLocation: true,
          }}
        >
          <MemoryRouter initialEntries={['/settings/roles']}>
            <WorkspaceRouteObjectsContext.Provider
              value={[
                {
                  path: '/settings/*',
                  element: <ScopeIdProbe />,
                  handle: { workspaceSurfaces: ['main', 'side-panel'] },
                },
              ]}
            >
              <WorkspaceRoutes />
            </WorkspaceRouteObjectsContext.Provider>
          </MemoryRouter>
        </WorkspaceSurfaceContext.Provider>
      </JotaiProvider>,
    );

    expect(screen.getByTestId('scope-id')).toHaveTextContent('panel-flow-7');
  });
});
