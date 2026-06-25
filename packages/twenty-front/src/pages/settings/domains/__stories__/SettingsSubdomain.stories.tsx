import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsSubdomainPage } from '~/pages/settings/domains/SettingsSubdomainPage';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Domains/SettingsSubdomain',
  component: SettingsSubdomainPage,
  decorators: [PageDecorator],
  args: { routePath: '/settings/domains/subdomain' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsSubdomainPage>;

export const Default: Story = {};

export const TooShortSubdomain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByRole('textbox', {}, { timeout: 5000 });

    await userEvent.clear(input);
    await userEvent.type(input, 'ab');

    const errorMessage = await canvas.findByText(
      'Subdomain can not be shorter than 3 characters',
    );

    await expect(errorMessage).toBeVisible();

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
