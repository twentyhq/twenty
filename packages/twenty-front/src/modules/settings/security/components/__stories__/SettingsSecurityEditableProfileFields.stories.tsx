import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsSecurityEditableProfileFields } from '@/settings/security/components/SettingsSecurityEditableProfileFields';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedUserData } from '~/testing/mock-data/users';

const workspace = {
  ...mockedUserData.currentWorkspace,
  workspaceCustomApplication:
    mockedUserData.currentWorkspace.workspaceCustomApplication ?? null,
  installedApplications: [],
  editableProfileFields: ['email'],
};
const updates: string[][] = [];

const meta: Meta<typeof SettingsSecurityEditableProfileFields> = {
  title: 'Modules/Settings/Security/EditableProfileFields',
  component: SettingsSecurityEditableProfileFields,
  decorators: [ToastDecorator, ComponentDecorator],
  beforeEach: () => {
    updates.length = 0;
    jotaiStore.set(currentWorkspaceState.atom, workspace);
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('UpdateWorkspace', ({ variables }) => {
          updates.push(variables.input.editableProfileFields);
          return HttpResponse.json({
            data: {
              updateWorkspace: {
                ...workspace,
                ...variables.input,
                __typename: 'Workspace',
              },
            },
          });
        }),
      ],
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const MultipleFieldsRemainOpen: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog');
    const firstName = within(popup).getByRole('button', { name: 'First Name' });
    await userEvent.click(firstName);
    expect(firstName).toHaveAttribute('aria-pressed', 'true');
    expect(popup).toBeVisible();
    await waitFor(() => expect(updates).toEqual([['email', 'firstName']]));
    await userEvent.click(within(popup).getByRole('button', { name: 'Email' }));
    await waitFor(() =>
      expect(updates).toEqual([['email', 'firstName'], ['firstName']]),
    );
    expect(trigger).toHaveTextContent('First Name');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
