import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { MultiWorkspaceDropdownButton } from '@/navigation/components/MultiWorkspaceDropdown/MultiWorkspaceDropdownButton';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { OpenRecordIn } from 'twenty-shared/types';
import { type AvailableWorkspace } from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

const updateWorkspaceMemberSettings = fn();
const AVAILABLE_WORKSPACES: AvailableWorkspace[] = [
  {
    id: mockCurrentWorkspace.id,
    displayName: 'Twenty',
    sso: [],
    workspaceUrls: { subdomainUrl: 'https://twenty.example.com' },
  },
  {
    id: 'acme',
    displayName: 'Acme',
    sso: [],
    workspaceUrls: { subdomainUrl: 'https://acme.example.com' },
  },
  {
    id: 'venture',
    displayName: 'Venture',
    sso: [],
    workspaceUrls: { subdomainUrl: 'https://venture.example.com' },
  },
  {
    id: 'studio',
    displayName: 'Studio',
    sso: [],
    workspaceUrls: { subdomainUrl: 'https://studio.example.com' },
  },
];
const INVITED_WORKSPACE: AvailableWorkspace = {
  id: 'invited',
  displayName: 'Invited workspace',
  inviteHash: 'workspace-invite',
  personalInviteToken: 'personal-invite',
  sso: [],
  workspaceUrls: { subdomainUrl: 'https://invited.example.com' },
};

const meta: Meta<typeof MultiWorkspaceDropdownButton> = {
  title: 'Modules/Navigation/MultiWorkspaceDropdown/Workspace menu',
  component: MultiWorkspaceDropdownButton,
  decorators: [ComponentWithRouterDecorator, ToastDecorator],
  beforeEach: () => {
    updateWorkspaceMemberSettings.mockClear();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      ...mockedWorkspaceMemberData,
      openRecordIn: OpenRecordIn.SIDE_PANEL,
    });
    jotaiStore.set(isNavigationDrawerExpandedState.atom, true);
    jotaiStore.set(isMultiWorkspaceEnabledState.atom, true);
    jotaiStore.set(domainConfigurationState.atom, {
      frontDomain: 'example.com',
      defaultSubdomain: 'app',
      publicFunctionDomain: undefined,
    });
    jotaiStore.set(availableWorkspacesState.atom, {
      availableWorkspacesForSignIn: AVAILABLE_WORKSPACES,
      availableWorkspacesForSignUp: [INVITED_WORKSPACE],
    });
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('UpdateWorkspaceMemberSettings', ({ variables }) => {
          updateWorkspaceMemberSettings(variables.input);
          return HttpResponse.json({
            data: { updateWorkspaceMemberSettings: true },
          });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof MultiWorkspaceDropdownButton>;

export const PagesAndWorkspaceLinks: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const openWindow = spyOn(window, 'open').mockImplementation(() => null);

    try {
      await userEvent.click(canvas.getByTestId('workspace-dropdown'));
      const menu = await canvas.findByRole('menu', { name: 'Twenty' });
      const trigger = canvas.getByRole('button', { name: 'Twenty' });
      expect(trigger).toHaveAttribute('tabindex', '0');
      await waitFor(() => {
        expect(menu).toHaveAttribute('data-side', 'bottom');
        expect(menu.getBoundingClientRect().top).toBeLessThan(
          trigger.getBoundingClientRect().bottom,
        );
      });
      expect(
        canvas.getByRole('menuitem', { name: 'Invite user' }),
      ).toHaveAttribute('href', '/settings/members#invite');
      await userEvent.click(canvas.getByRole('menuitem', { name: /Open in/ }));
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Full page' }),
      );
      await waitFor(() => {
        expect(updateWorkspaceMemberSettings).toHaveBeenCalledWith({
          workspaceMemberId: mockedWorkspaceMemberData.id,
          update: { openRecordIn: OpenRecordIn.RECORD_PAGE },
        });
        expect(
          canvas.getByRole('button', { name: 'Full page', pressed: true }),
        ).toBeVisible();
      });
      await userEvent.keyboard('{Escape}');
      await waitFor(() =>
        expect(canvas.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      await userEvent.click(canvas.getByTestId('workspace-dropdown'));
      expect(
        await canvas.findByRole('menuitem', { name: /Theme/ }),
      ).toBeVisible();
      await userEvent.click(
        canvas.getByRole('button', { name: 'More options' }),
      );
      await userEvent.click(
        await canvas.findByRole('menuitem', { name: 'Create Workspace' }),
      );
      await waitFor(() =>
        expect(
          canvas.queryByRole('menuitem', { name: 'Log out' }),
        ).not.toBeInTheDocument(),
      );
      expect(canvas.getByRole('menuitem', { name: /Theme/ })).toBeVisible();
      await userEvent.click(
        canvas.getByRole('menuitemradio', { name: 'Acme' }),
      );
      await waitFor(() =>
        expect(openWindow).toHaveBeenCalledWith(
          'https://acme.example.com/welcome?locale=en',
          '_self',
        ),
      );
      await userEvent.click(
        canvas.getByRole('menuitem', { name: 'Other workspaces' }),
      );
      await userEvent.type(
        await canvas.findByRole('searchbox', { name: 'Search' }),
        'Invited',
      );
      expect(
        canvas.queryByRole('link', { name: 'Acme' }),
      ).not.toBeInTheDocument();
      const invitedWorkspace = canvas.getByRole('link', {
        name: 'Invited workspace',
      });
      expect(invitedWorkspace).toHaveAttribute(
        'href',
        'https://invited.example.com/invite/workspace-invite?inviteToken=personal-invite',
      );
      await userEvent.click(invitedWorkspace);
      await waitFor(() =>
        expect(openWindow).toHaveBeenCalledWith(
          'https://invited.example.com/invite/workspace-invite?inviteToken=personal-invite&locale=en',
          '_self',
        ),
      );
      await userEvent.keyboard('{Escape}');
      await waitFor(() =>
        expect(canvas.queryByRole('dialog')).not.toBeInTheDocument(),
      );
    } finally {
      openWindow.mockRestore();
    }
  },
};

export const RootInvitationLink: Story = {
  beforeEach: () => {
    jotaiStore.set(availableWorkspacesState.atom, {
      availableWorkspacesForSignIn: AVAILABLE_WORKSPACES.slice(0, 2),
      availableWorkspacesForSignUp: [INVITED_WORKSPACE],
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Twenty' }));
    const invitedWorkspace = await canvas.findByRole('menuitemradio', {
      name: 'Invited workspace',
    });

    expect(invitedWorkspace).toHaveAttribute(
      'href',
      'https://invited.example.com/invite/workspace-invite?inviteToken=personal-invite',
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

export const MobileBoundary: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <div style={{ position: 'fixed', left: 20, right: 20, top: 20 }}>
      <MultiWorkspaceDropdownButton />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByTestId('workspace-dropdown'));
    const menu = await canvas.findByRole('menu', { name: 'Twenty' });

    expect(canvas.getByRole('menuitem', { name: 'Settings' })).toBeVisible();
    expect(
      canvas.queryByRole('menuitem', { name: /Open in/ }),
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(menu).toHaveAttribute('data-side', 'bottom');
      expect(menu.getBoundingClientRect().left).toBeCloseTo(16, 0);
      expect(menu.getBoundingClientRect().right).toBeLessThanOrEqual(
        window.innerWidth - 16,
      );
    });
  },
};
