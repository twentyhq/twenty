import { WorkspaceRouteObjectsContext } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { type WorkspaceRouteObject } from '@/app/routing/types/WorkspaceRouteObject';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreAgentEditSessionEffect } from '@/object-core/agents/components/CoreAgentEditSessionEffect';
import { CoreAgentEditingScope } from '@/object-core/agents/components/CoreAgentEditingScope';
import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useCoreAgentField } from '@/object-core/agents/hooks/useCoreAgentField';
import { useDiscardCoreAgentChanges } from '@/object-core/agents/hooks/useDiscardCoreAgentChanges';
import { useSaveCoreAgentChanges } from '@/object-core/agents/hooks/useSaveCoreAgentChanges';
import { coreAgentEditSessionFamilyState } from '@/object-core/agents/states/coreAgentEditSessionFamilyState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { SettingsRolePermissionsObjectLevelSection } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSection';
import { SettingsRolePermissionsObjectsSection } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectsSection';
import { SettingsRoleDraftSyncEffect } from '@/settings/roles/role/components/SettingsRoleDraftSyncEffect';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleSaveSubmissionFamilyState } from '@/settings/roles/states/settingsRoleSaveSubmissionFamilyState';
import { SidePanelRouter } from '@/side-panel/components/SidePanelRouter';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { TextArea } from '@/ui/input/components/TextArea';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  type UpsertObjectPermissionsMutation,
  type UpsertObjectPermissionsMutationVariables,
  type UpdateOneRoleMutation,
  type UpdateOneRoleMutationVariables,
  type UpdateOneAgentMutation,
  type UpdateOneAgentMutationVariables,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { SettingsRoleAddObjectLevel } from '~/pages/settings/members/roles/SettingsRoleAddObjectLevel';
import { SettingsRoleObjectLevel } from '~/pages/settings/members/roles/SettingsRoleObjectLevel';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const AGENT: CoreAgent = {
  __typename: 'Agent',
  id: 'agent-id',
  name: 'agent',
  label: 'Agent',
  description: '',
  icon: null,
  prompt: 'Original instructions',
  modelId: 'workspace-default-model',
  responseFormat: null,
  roleId: 'role-id',
  isSystem: false,
  isActive: true,
  modelConfiguration: {},
  triggers: [],
  applicationId: 'custom-application',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
const ROLE = {
  ...DEFAULT_SETTINGS_DRAFT_ROLE,
  __typename: 'Role' as const,
  universalIdentifier: 'agent-role-universal-id',
  description: '',
  icon: null,
  id: 'role-id',
  label: 'Agent role',
  applicationId: 'custom-application',
  isEditable: true,
  canBeAssignedToAgents: true,
  agents: [AGENT],
};
let remoteAgent = AGENT;
let remoteRole = ROLE;
let ensureCalls = 0;
let roleReadCalls = 0;
let shouldFailSettings = true;
let releaseSave: () => void;
let pendingSave: Promise<void>;

const SaveActions = () => {
  const { canSave, isSaving } = useCoreAgentEditStatus({ agentId: AGENT.id });
  const { saveCoreAgentChanges } = useSaveCoreAgentChanges({
    agentId: AGENT.id,
  });
  return (
    <Button
      disabled={!canSave}
      loading={isSaving}
      onClick={() => void saveCoreAgentChanges()}
    >
      Save settings
    </Button>
  );
};

const CoreAgentEditingSession = ({
  showObjectPermissions = false,
}: {
  showObjectPermissions?: boolean;
}) => {
  const { value: prompt = '', setValue: setPrompt } = useCoreAgentField({
    agentId: AGENT.id,
    field: 'prompt',
  });
  const { error, isSaving, isRoleDirty, isRoleEditable } =
    useCoreAgentEditStatus({ agentId: AGENT.id });
  const { discardCoreAgentChanges } = useDiscardCoreAgentChanges({
    agentId: AGENT.id,
  });
  return (
    <>
      <CoreAgentEditSessionEffect agent={AGENT} />
      <SettingsRoleDraftSyncEffect roleId={ROLE.id} />
      <TextArea
        textAreaId="session-instructions"
        label="Instructions"
        value={prompt}
        onChange={setPrompt}
      />
      <SettingsRolePermissionsObjectsSection
        roleId={ROLE.id}
        isEditable={isRoleEditable}
      />
      {showObjectPermissions && (
        <SettingsRolePermissionsObjectLevelSection
          roleId={ROLE.id}
          fromAgentId={AGENT.id}
          isEditable={isRoleEditable}
        />
      )}
      <SaveActions />
      <Button
        disabled={isSaving}
        onClick={() => void discardCoreAgentChanges()}
      >
        Discard settings
      </Button>
      {error && <div role="alert">{error}</div>}
      <output>
        {isRoleDirty ? 'Unsaved permissions' : 'Permissions saved'}
      </output>
    </>
  );
};

const PERMISSION_NAVIGATION_ROUTES: WorkspaceRouteObject[] = [
  {
    path: getSettingsPath(SettingsPath.RoleAddObjectLevel),
    element: <SettingsRoleAddObjectLevel />,
    handle: { workspaceSurfaces: ['main', 'side-panel'] },
  },
  {
    path: getSettingsPath(SettingsPath.RoleObjectLevel),
    element: <SettingsRoleObjectLevel />,
    handle: { workspaceSurfaces: ['main', 'side-panel'] },
  },
  {
    path: AppPath.AgentShowPage,
    element: <CoreAgentEditingSession showObjectPermissions />,
    handle: { workspaceSurfaces: ['main', 'side-panel'] },
  },
];

const CoreAgentPermissionNavigation = () => {
  const [isEditorMounted, setIsEditorMounted] = useState(true);
  const sidePanelNavigationStack = useAtomStateValue(
    sidePanelNavigationStackState,
  );
  const location = useLocation();

  return (
    <WorkspaceRouteObjectsContext.Provider value={PERMISSION_NAVIGATION_ROUTES}>
      <output aria-label="Main location">{location.pathname}</output>
      <Button onClick={() => setIsEditorMounted(false)}>Unmount editor</Button>
      {isEditorMounted && (
        <CoreAgentEditingScope agentId={AGENT.id}>
          <CoreAgentEditingSession showObjectPermissions />
        </CoreAgentEditingScope>
      )}
      {sidePanelNavigationStack.length > 0 && (
        <section aria-label="Permission panel">
          <SidePanelRouter />
        </section>
      )}
    </WorkspaceRouteObjectsContext.Provider>
  );
};

const meta: Meta<typeof CoreAgentEditingSession> = {
  title: 'Modules/ObjectCore/Agents/CoreAgentEditingSession',
  component: CoreAgentEditingSession,
  decorators: [MemoryRouterDecorator, ComponentDecorator],
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
    remoteAgent = AGENT;
    remoteRole = ROLE;
    ensureCalls = 0;
    roleReadCalls = 0;
    shouldFailSettings = true;
    pendingSave = new Promise<void>((resolve) => {
      releaseSave = resolve;
    });
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      workspaceCustomApplication: {
        ...mockCurrentWorkspace.workspaceCustomApplication,
        id: 'custom-application',
      },
    });
    jotaiStore.set(currentUserWorkspaceState.atom, {
      permissionFlags: [
        PermissionFlagType.AI_SETTINGS,
        PermissionFlagType.ROLES,
      ],
      objectsPermissions: [],
      twoFactorAuthenticationMethodSummary: [],
      isImpersonating: false,
    });
    jotaiStore.set(
      coreAgentEditSessionFamilyState.getAtom(AGENT.id, null),
      undefined,
    );
    jotaiStore.set(
      settingsRoleSaveSubmissionFamilyState.getAtom(ROLE.id, null),
      undefined,
    );
    jotaiStore.set(settingsPersistedRoleFamilyState.atomFamily(ROLE.id), ROLE);
    jotaiStore.set(settingsDraftRoleFamilyState.getAtom(ROLE.id, null), ROLE);
    jotaiStore.set(
      settingsDraftRoleBaseFamilyState.getAtom(ROLE.id, null),
      ROLE,
    );
    return () => releaseSave();
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('EnsureAgentRole', async () => {
          ensureCalls += 1;
          await pendingSave;
          return HttpResponse.json({ data: { ensureAgentRole: remoteRole } });
        }),
        graphql.mutation<UpdateOneRoleMutation, UpdateOneRoleMutationVariables>(
          'UpdateOneRole',
          ({ variables }) => {
            remoteRole = {
              ...remoteRole,
              canReadAllObjectRecords:
                variables.updateRoleInput.update.canReadAllObjectRecords ??
                remoteRole.canReadAllObjectRecords,
            };
            return HttpResponse.json({ data: { updateOneRole: remoteRole } });
          },
        ),
        graphql.mutation<
          UpdateOneAgentMutation,
          UpdateOneAgentMutationVariables
        >('UpdateOneAgent', ({ variables }) => {
          if (shouldFailSettings) {
            shouldFailSettings = false;
            return HttpResponse.json({
              errors: [{ message: 'Settings could not be saved' }],
            });
          }
          remoteAgent = {
            ...remoteAgent,
            prompt: variables.input.prompt ?? remoteAgent.prompt,
          };
          return HttpResponse.json({ data: { updateOneAgent: remoteAgent } });
        }),
        graphql.mutation<
          UpsertObjectPermissionsMutation,
          UpsertObjectPermissionsMutationVariables
        >('UpsertObjectPermissions', ({ variables }) => {
          const objectPermissions =
            variables.upsertObjectPermissionsInput.objectPermissions.map(
              (permission) => ({
                __typename: 'ObjectPermission' as const,
                objectMetadataId: permission.objectMetadataId,
                canReadObjectRecords: permission.canReadObjectRecords ?? null,
                canUpdateObjectRecords:
                  permission.canUpdateObjectRecords ?? null,
                canSoftDeleteObjectRecords:
                  permission.canSoftDeleteObjectRecords ?? null,
                canDestroyObjectRecords:
                  permission.canDestroyObjectRecords ?? null,
                restrictedFields: {},
              }),
            );
          remoteRole = { ...remoteRole, objectPermissions };
          return HttpResponse.json({
            data: { upsertObjectPermissions: objectPermissions },
          });
        }),
        graphql.query('FindOneAgent', () =>
          HttpResponse.json({ data: { findOneAgent: remoteAgent } }),
        ),
        graphql.query('GetRoles', () => {
          roleReadCalls += 1;
          return HttpResponse.json({
            data: { getRoles: [remoteRole], getPermissionFlags: [] },
          });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CoreAgentEditingSession>;

export const PartialSaveAndRetry: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prompt = await canvas.findByRole('textbox', { name: 'Instructions' });
    await waitFor(() => expect(prompt).toHaveValue(AGENT.prompt));
    await userEvent.clear(prompt);
    await userEvent.type(prompt, 'Submitted instructions');
    const readPermission = canvas.getByRole('checkbox', {
      name: 'See Records on All Objects',
    });
    await userEvent.click(readPermission);
    await userEvent.dblClick(
      canvas.getByRole('button', { name: 'Save settings' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Discard settings' }),
    ).toBeDisabled();
    await userEvent.clear(prompt);
    await userEvent.type(prompt, AGENT.prompt);
    releaseSave();
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Settings could not be saved',
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Discard settings' }),
      ).toBeEnabled(),
    );
    await expect(readPermission).toBeChecked();
    await expect(canvas.getByText('Permissions saved')).toBeVisible();
    await expect(prompt).toHaveValue(AGENT.prompt);
    await expect(ensureCalls).toBe(1);
    await userEvent.clear(prompt);
    await userEvent.type(prompt, 'Retry instructions');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save settings' }),
    );
    await waitFor(() =>
      expect(canvas.queryByRole('alert')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Save settings' }),
      ).toBeDisabled(),
    );
    await expect(ensureCalls).toBe(1);
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Discard settings' }),
      ).toBeEnabled(),
    );
    await userEvent.clear(prompt);
    await userEvent.type(prompt, 'Discard these instructions');
    await userEvent.click(readPermission);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Discard settings' }),
    );
    await expect(prompt).toHaveValue('Retry instructions');
    await expect(readPermission).toBeChecked();
  },
};

export const SettingsWithoutRoleAccess: Story = {
  beforeEach: () => {
    const userWorkspace = jotaiStore.get(currentUserWorkspaceState.atom);
    if (userWorkspace) {
      jotaiStore.set(currentUserWorkspaceState.atom, {
        ...userWorkspace,
        permissionFlags: [PermissionFlagType.AI_SETTINGS],
      });
    }
    shouldFailSettings = false;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prompt = await canvas.findByRole('textbox', { name: 'Instructions' });
    await waitFor(() => expect(prompt).toHaveValue(AGENT.prompt));
    await userEvent.clear(prompt);
    await userEvent.type(prompt, 'Configuration without role access');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save settings' }),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Discard settings' }),
      ).toBeEnabled(),
    );
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Save settings' }),
    ).toBeDisabled();
    await expect(roleReadCalls).toBe(0);
  },
};

export const PermissionNavigationRetainsDraft: Story = {
  render: () => <CoreAgentPermissionNavigation />,
  decorators: [ObjectMetadataItemsDecorator],
  parameters: {
    currentUserWorkspace: {
      permissionFlags: [
        PermissionFlagType.AI_SETTINGS,
        PermissionFlagType.ROLES,
      ],
      objectsPermissions: [],
      twoFactorAuthenticationMethodSummary: [],
      isImpersonating: false,
    },
  },
  beforeEach: () => {
    shouldFailSettings = false;
    releaseSave();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prompt = await canvas.findByRole('textbox', { name: 'Instructions' });
    await waitFor(() => expect(prompt).toHaveValue(AGENT.prompt));
    await userEvent.clear(prompt);
    await userEvent.type(prompt, 'Instructions retained through permissions');
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Add rule' }),
    );
    const panel = within(
      await canvas.findByRole('region', { name: 'Permission panel' }),
    );
    await userEvent.click(await panel.findByText('Companies', { exact: true }));
    await userEvent.click(
      await panel.findByText('See Companies', { exact: true }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Unmount editor' }),
    );
    await userEvent.click(panel.getByRole('link', { name: 'Finish' }));
    await expect(
      await panel.findByRole('textbox', { name: 'Instructions' }),
    ).toHaveValue('Instructions retained through permissions');
    await expect(panel.getByText('Unsaved permissions')).toBeVisible();
    await expect(canvas.getByLabelText('Main location')).toHaveTextContent('/');
    await userEvent.click(panel.getByRole('button', { name: 'Save settings' }));
    await waitFor(() =>
      expect(remoteAgent.prompt).toBe(
        'Instructions retained through permissions',
      ),
    );
    await waitFor(() =>
      expect(remoteRole.objectPermissions).toEqual([
        expect.objectContaining({
          objectMetadataId: getMockObjectMetadataItemOrThrow('company').id,
          canReadObjectRecords: true,
        }),
      ]),
    );
    await expect(panel.queryByRole('alert')).not.toBeInTheDocument();
  },
};
