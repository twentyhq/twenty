import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

import { SettingsSubdomainPage } from '~/pages/settings/domains/SettingsSubdomainPage';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Domains/SettingsSubdomain',
  component: SettingsSubdomainPage,
  decorators: [PageDecorator],
  args: { routePath: '/settings/domains/subdomain' },
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);

    return () => {
      jotaiStore.set(currentWorkspaceState.atom, null);
    };
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsSubdomainPage>;

export const Default: Story = {};

export const EmptySubdomain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByRole('textbox', {}, { timeout: 5000 });

    await expect(input).toHaveValue(mockCurrentWorkspace.subdomain);

    await userEvent.clear(input);

    await canvas.findByText('Subdomain cannot be empty');

    const saveButton = canvas.getByText('Save');

    await expect(saveButton.closest('button')).toBeDisabled();
  },
};

export const InvalidCharacters: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByRole('textbox', {}, { timeout: 5000 });

    await userEvent.clear(input);
    await userEvent.type(input, 'api-test');

    const errorMessage = await canvas.findByText(
      'Use letter, number and dash only. Start and finish with a letter or a number',
    );

    await expect(errorMessage).toBeVisible();

    const saveButton = canvas.getByText('Save');

    await expect(saveButton.closest('button')).toBeDisabled();
  },
};

export const ReservedSubdomain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByRole('textbox', {}, { timeout: 5000 });

    await userEvent.clear(input);
    await userEvent.type(input, 'api');

    const errorMessage = await canvas.findByText('This subdomain is reserved');

    await expect(errorMessage).toBeVisible();

    const saveButton = canvas.getByText('Save');

    await expect(saveButton.closest('button')).toBeDisabled();
  },
};

export const ValidSubdomain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByRole('textbox', {}, { timeout: 5000 });

    await userEvent.clear(input);
    await userEvent.type(input, 'my-workspace');

    const saveButton = canvas.getByText('Save');

    await expect(saveButton.closest('button')).toBeEnabled();
  },
};
