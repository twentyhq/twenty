import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { SettingsRolesList } from '@/settings/roles/components/SettingsRolesList';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

const [, secondMockedRole] = mockedRoles;

assertIsDefinedOrThrow(secondMockedRole);

const ROLES = [
  ...mockedRoles,
  {
    ...secondMockedRole,
    id: 'agent-only-role',
    label: 'Agent only',
    canBeAssignedToUsers: false,
    canBeAssignedToAgents: true,
    canBeAssignedToApiKeys: false,
    workspaceMembers: [],
  },
  {
    ...secondMockedRole,
    id: 'api-key-only-role',
    label: 'API key only',
    canBeAssignedToUsers: false,
    canBeAssignedToAgents: false,
    canBeAssignedToApiKeys: true,
    workspaceMembers: [],
  },
];

const meta: Meta<typeof SettingsRolesList> = {
  title: 'Modules/Settings/Roles/SettingsRolesList',
  component: SettingsRolesList,
  decorators: [ComponentWithRouterDecorator],
  beforeEach: () => {
    jotaiStore.set(
      settingsRoleIdsState.atom,
      ROLES.map((role) => role.id),
    );

    for (const role of ROLES) {
      jotaiStore.set(
        settingsPersistedRoleFamilyState.atomFamily(role.id),
        role,
      );
    }
  },
};

export default meta;
type Story = StoryObj<typeof SettingsRolesList>;

export const FilterPanelTogglesStayOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(await canvas.findByText('Admin')).toBeVisible();
    expect(canvas.queryByText('Agent only')).not.toBeInTheDocument();

    const trigger = canvas.getByRole('button', { name: 'Filter' });

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Filter' });
    const agentRoles = within(popup).getByRole('switch', {
      name: 'Agent roles',
    });

    await waitFor(() => expect(agentRoles).toHaveFocus());
    await userEvent.keyboard(' ');
    expect(agentRoles).toBeChecked();
    expect(await canvas.findByText('Agent only')).toBeVisible();
    expect(popup).toBeVisible();

    await userEvent.tab();
    const apiKeyRoles = within(popup).getByRole('switch', {
      name: 'API key roles',
    });

    expect(apiKeyRoles).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(apiKeyRoles).toBeChecked();
    expect(await canvas.findByText('API key only')).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
