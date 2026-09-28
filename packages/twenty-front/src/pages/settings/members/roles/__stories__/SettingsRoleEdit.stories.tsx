import { type Meta, type StoryObj } from '@storybook/react-vite';
import { delay, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

import { SettingsRoleEdit } from '~/pages/settings/members/roles/SettingsRoleEdit';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

const OBJECT_RESTRICTED_ROLE_ID = '1e5b6baf-cd29-4d78-a3f1-55fb1fd27a81';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Roles/SettingsRoleEdit',
  component: SettingsRoleEdit,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/members/roles/:roleId',
    routeParams: {
      ':roleId': '1',
    },
  },
  parameters: {
    msw: graphqlMocks,
  },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsRoleEdit>;

export const Default: Story = {};

export const ObjectPermissionRowMenu: Story = {
  args: {
    routeParams: {
      ':roleId': OBJECT_RESTRICTED_ROLE_ID,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const [trigger] = await canvas.findAllByRole(
      'button',
      { name: 'Object permission options' },
      { timeout: 5000 },
    );

    assertIsDefinedOrThrow(trigger);

    await userEvent.click(trigger);
    const menu = await body.findByRole('menu', {
      name: 'Object permission options',
    });

    expect(canvas.getByRole('link', { name: 'Assignment' })).toBeVisible();
    expect(
      within(menu).getByRole('menuitem', { name: 'Edit' }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining(
        `/settings/members/roles/${OBJECT_RESTRICTED_ROLE_ID}/object/`,
      ),
    );
    expect(
      within(menu).getByRole('menuitem', { name: 'Remove rule' }),
    ).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(menu).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const RoleAssignmentPickers: Story = {
  args: {
    routeParams: {
      ':roleId': OBJECT_RESTRICTED_ROLE_ID,
    },
  },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query('FindManyAgents', () =>
          HttpResponse.json({ data: { findManyAgents: [] } }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole(
        'link',
        { name: 'Assignment' },
        { timeout: 5000 },
      ),
    );

    const assignToMember = await canvas.findByRole('button', {
      name: 'Assign to member',
    });

    expect(assignToMember).toBeDisabled();
    await userEvent.hover(assignToMember.parentElement as HTMLElement);
    expect(
      await body.findByText('All workspace members already have this role'),
    ).toBeVisible();
    await userEvent.unhover(assignToMember.parentElement as HTMLElement);

    const assignToAgent = canvas.getByRole('button', {
      name: 'Assign to agent',
    });

    await userEvent.click(assignToAgent);
    const agentPicker = await body.findByRole('dialog', {
      name: 'Assign to agent',
    });

    expect(
      await within(agentPicker).findByText('No agents available', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible();
    await userEvent.type(
      within(agentPicker).getByRole('searchbox', { name: 'Search agents' }),
      'Sales',
    );
    expect(
      await within(agentPicker).findByText('No agents match your search'),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(agentPicker).not.toBeInTheDocument());
    await waitFor(() => expect(assignToAgent).toHaveFocus());

    await userEvent.click(
      canvas.getByRole('button', { name: 'Assign to API key' }),
    );
    const apiKeyPicker = await body.findByRole('dialog', {
      name: 'Assign to API key',
    });
    const search = within(apiKeyPicker).getByRole('searchbox', {
      name: 'Search API keys',
    });

    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.type(search, 'unknown');
    expect(
      await within(apiKeyPicker).findByText('No API keys match your search'),
    ).toBeVisible();
    await userEvent.clear(search);
    await userEvent.click(
      await within(apiKeyPicker).findByRole('button', { name: 'My api key' }),
    );

    await waitFor(() => expect(apiKeyPicker).not.toBeInTheDocument());
    const confirmation = await body.findByRole('dialog', {
      name: 'Assign My api key?',
    });

    await waitFor(() =>
      expect(confirmation).toContainElement(
        canvasElement.ownerDocument.activeElement as HTMLElement,
      ),
    );
  },
};

export const RoleAssignmentPickerLoading: Story = {
  args: {
    routeParams: {
      ':roleId': OBJECT_RESTRICTED_ROLE_ID,
    },
  },
  parameters: {
    msw: {
      handlers: [
        metadataGraphql.query('FindManyAgents', async () => {
          await delay('infinite');

          return HttpResponse.json({ data: { findManyAgents: [] } });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole(
        'link',
        { name: 'Assignment' },
        { timeout: 5000 },
      ),
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Assign to agent' }),
    );
    const agentPicker = await body.findByRole('dialog', {
      name: 'Assign to agent',
    });

    expect(within(agentPicker).getByText('Loading...')).toBeVisible();
    expect(
      within(agentPicker).queryByText('No agents available'),
    ).not.toBeInTheDocument();
  },
};
