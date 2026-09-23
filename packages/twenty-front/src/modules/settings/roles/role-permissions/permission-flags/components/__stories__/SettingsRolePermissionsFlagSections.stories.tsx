import { currentUserState } from '@/auth/states/currentUserState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { IsMinimalMetadataReadyEffect } from '@/metadata-store/effect-components/IsMinimalMetadataReadyEffect';
import { MetadataStoreSSEEffect } from '@/metadata-store/effect-components/MetadataStoreSSEEffect';
import { useLoadStaleMetadataEntities } from '@/metadata-store/hooks/useLoadStaleMetadataEntities';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { graphql, HttpResponse } from 'msw';
import { useEffect } from 'react';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsRolePermissionsSettingsSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsSection';
import { SettingsRolePermissionsToolSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsToolSection';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

const ROLE_ID = 'role-id';
const APP_SETTINGS_FLAG = 'APP_MANAGE_CONFIGURATION';
const APP_TOOL_FLAG = 'APP_SEND_NOTIFICATION';

const permissionFlags = [
  {
    id: 'app-settings',
    applicationId: 'notification-app',
    key: APP_SETTINGS_FLAG,
    label: 'Configure notifications',
    description: 'Manage notification preferences',
    icon: 'IconSettings',
    permissionType: 'settings',
  },
  {
    id: 'app-tool',
    applicationId: 'notification-app',
    key: APP_TOOL_FLAG,
    label: 'Send notification',
    description: null,
    icon: null,
    permissionType: 'tool',
  },
  {
    id: 'standard-settings',
    applicationId: 'standard-app',
    key: PermissionFlagType.APPLICATIONS,
    label: 'Duplicate standard permission',
    description: null,
    icon: null,
    permissionType: 'settings',
  },
];

const SettingsRolePermissionsFlagSections = ({
  isEditable,
}: {
  isEditable: boolean;
  assignment: 'users' | 'agents' | 'apiKeys';
}) => (
  <>
    <MetadataStoreSSEEffect />
    <section aria-label="Layout permissions">
      <SettingsRolePermissionsSettingsSection
        roleId={ROLE_ID}
        isEditable={isEditable}
      />
    </section>
    <section aria-label="Logic permissions">
      <SettingsRolePermissionsToolSection
        roleId={ROLE_ID}
        isEditable={isEditable}
      />
    </section>
  </>
);

const meta: Meta<typeof SettingsRolePermissionsFlagSections> = {
  title:
    'Modules/Settings/Roles/RolePermissions/SettingsRolePermissionsFlagSections',
  component: SettingsRolePermissionsFlagSections,
  decorators: [ComponentDecorator],
  args: { isEditable: true, assignment: 'users' },
  beforeEach: ({ args }) => {
    jotaiStore.set(metadataStoreState.atomFamily('permissionFlags'), {
      current: permissionFlags,
      draft: [],
      status: 'up-to-date',
    });
    const roleAtom = settingsDraftRoleFamilyState.atomFamily(ROLE_ID);
    jotaiStore.set(roleAtom, {
      ...jotaiStore.get(roleAtom),
      id: ROLE_ID,
      canBeAssignedToUsers: args.assignment === 'users',
      canBeAssignedToAgents: args.assignment === 'agents',
      canBeAssignedToApiKeys: args.assignment === 'apiKeys',
      permissionFlags: [
        { id: 'app-tool-grant', roleId: ROLE_ID, flag: APP_TOOL_FLAG },
      ],
    });
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      installedApplications: [
        {
          id: 'notification-app',
          name: 'Notifications',
          universalIdentifier: 'notification-app',
          logoUrl: null,
        },
        {
          id: 'standard-app',
          name: 'Standard',
          universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          logoUrl: null,
        },
      ],
    });
  },
};

export default meta;
type Story = StoryObj<typeof SettingsRolePermissionsFlagSections>;

export const ForUsers: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const layout = within(
      canvas.getByRole('region', { name: 'Layout permissions' }),
    );
    const logic = within(
      canvas.getByRole('region', { name: 'Logic permissions' }),
    );
    await expect(
      await layout.findByText('Configure notifications'),
    ).toBeVisible();
    await expect(
      layout.getByText('Manage notification preferences'),
    ).toBeVisible();
    await expect(logic.getByText('Send notification')).toBeVisible();
    await expect(
      layout.queryByText('Send notification'),
    ).not.toBeInTheDocument();
    await expect(
      logic.queryByText('Configure notifications'),
    ).not.toBeInTheDocument();
    await expect(layout.getAllByText('Applications')).toHaveLength(1);
    await expect(layout.getByText('Notifications')).toBeVisible();
    await expect(logic.getByText('Notifications')).toBeVisible();
    await expect(layout.getByText('Standard')).toBeVisible();
    await expect(
      canvas.queryByText('Duplicate standard permission'),
    ).not.toBeInTheDocument();
  },
};

export const ForAgents: Story = {
  args: { assignment: 'agents' },
  play: ForUsers.play,
};
export const ForApiKeys: Story = {
  args: { assignment: 'apiKeys' },
  play: ForUsers.play,
};

export const ToggleApplicationFlags: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const layoutFlag = await canvas.findByRole('checkbox', {
      name: 'Configure notifications',
    });
    const logicFlag = canvas.getByRole('checkbox', {
      name: 'Send notification',
    });
    await expect(layoutFlag).not.toBeChecked();
    await expect(logicFlag).toBeChecked();
    await userEvent.click(layoutFlag);
    await expect(layoutFlag).toBeChecked();
    await expect(logicFlag).toBeChecked();
    await userEvent.click(layoutFlag);
    await userEvent.click(logicFlag);
    await expect(layoutFlag).not.toBeChecked();
    await expect(logicFlag).not.toBeChecked();
  },
};

export const ToggleAllLayoutFlags: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const layout = within(
      canvas.getByRole('region', { name: 'Layout permissions' }),
    );
    const appFlag = await layout.findByRole('checkbox', {
      name: 'Configure notifications',
    });
    const toggleAll = layout.getByRole('checkbox', {
      name: 'Toggle all permissions',
    });
    const logicFlag = canvas.getByRole('checkbox', {
      name: 'Send notification',
    });
    await userEvent.click(toggleAll);
    await expect(appFlag).toBeChecked();
    await expect(
      layout.getByRole('checkbox', { name: 'Applications' }),
    ).toBeChecked();
    await expect(logicFlag).toBeChecked();
    await userEvent.click(toggleAll);
    await expect(appFlag).not.toBeChecked();
    await expect(logicFlag).toBeChecked();
  },
};

export const ReadOnly: Story = {
  args: { isEditable: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const layoutFlag = await canvas.findByRole('checkbox', {
      name: 'Configure notifications',
    });
    const logicFlag = canvas.getByRole('checkbox', {
      name: 'Send notification',
    });
    await userEvent.click(layoutFlag);
    await userEvent.click(logicFlag);
    await expect(layoutFlag).not.toBeChecked();
    await expect(logicFlag).toBeChecked();
  },
};

export const LiveMetadataUpdates: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const permissionFlag = {
      ...permissionFlags[0],
      id: 'new-app-settings',
      key: 'APP_MANAGE_TEMPLATES',
      label: 'Manage templates',
    };
    dispatchMetadataOperationBrowserEvent({
      metadataName: 'permissionFlag',
      operation: { type: 'create', createdRecord: permissionFlag },
    });
    const checkbox = await canvas.findByRole('checkbox', {
      name: 'Manage templates',
    });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();

    dispatchMetadataOperationBrowserEvent({
      metadataName: 'permissionFlag',
      operation: {
        type: 'update',
        updatedRecord: { ...permissionFlag, label: 'Configure templates' },
      },
    });
    await expect(
      await canvas.findByRole('checkbox', { name: 'Configure templates' }),
    ).toBeChecked();
    await expect(
      canvas.queryByText('Manage templates'),
    ).not.toBeInTheDocument();

    dispatchMetadataOperationBrowserEvent({
      metadataName: 'permissionFlag',
      operation: { type: 'delete', deletedRecordId: permissionFlag.id },
    });
    await waitFor(() =>
      expect(canvas.queryByText('Configure templates')).not.toBeInTheDocument(),
    );
    await expect(canvas.getByText('Configure notifications')).toBeVisible();
  },
};

const SharedMetadataLoading = () => {
  const { loadStaleMetadataEntities } = useLoadStaleMetadataEntities();
  const isMinimalMetadataReady = useAtomStateValue(isMinimalMetadataReadyState);

  useEffect(() => {
    void loadStaleMetadataEntities(['permissionFlags']);
  }, [loadStaleMetadataEntities]);

  return (
    <>
      <IsMinimalMetadataReadyEffect />
      {isMinimalMetadataReady ? (
        <SettingsRolePermissionsFlagSections isEditable assignment="users" />
      ) : (
        <div role="status">Loading metadata</div>
      )}
    </>
  );
};

let releasePermissionFlags: () => void;
let permissionFlagsReady: Promise<void>;

export const InitialMetadataLoading: Story = {
  render: () => <SharedMetadataLoading />,
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
    jotaiStore.set(isCookieAuthActiveState.atom, true);
    jotaiStore.set(currentUserState.atom, mockedUserData);
    jotaiStore.set(isMinimalMetadataReadyState.atom, false);
    for (const key of [
      'objectMetadataItems',
      'fieldMetadataItems',
      'views',
      'viewFields',
    ] as const) {
      jotaiStore.set(metadataStoreState.atomFamily(key), {
        current: [],
        draft: [],
        status: 'up-to-date',
      });
    }
    jotaiStore.set(metadataStoreState.atomFamily('permissionFlags'), {
      current: [],
      draft: [],
      status: 'empty',
    });
    permissionFlagsReady = new Promise<void>((resolve) => {
      releasePermissionFlags = resolve;
    });
    return () => {
      releasePermissionFlags();
      jotaiStore.set(isCookieAuthActiveState.atom, false);
    };
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('GetPermissionFlags', async () => {
          await permissionFlagsReady;
          return HttpResponse.json({
            data: { getPermissionFlags: permissionFlags },
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('status')).toHaveTextContent(
      'Loading metadata',
    );
    await expect(
      canvas.queryByRole('checkbox', { name: 'Toggle all permissions' }),
    ).not.toBeInTheDocument();
    releasePermissionFlags();
    await expect(
      await canvas.findByRole('checkbox', { name: 'Configure notifications' }),
    ).toBeVisible();
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    const layout = within(
      canvas.getByRole('region', { name: 'Layout permissions' }),
    );
    await userEvent.click(
      layout.getByRole('checkbox', { name: 'Toggle all permissions' }),
    );
    await expect(
      layout.getByRole('checkbox', { name: 'Configure notifications' }),
    ).toBeChecked();
  },
};
