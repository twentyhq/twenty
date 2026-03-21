import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsCustomDomainPage } from '~/pages/settings/domains/SettingsCustomDomainPage';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Domains/SettingsCustomDomain',
  component: SettingsCustomDomainPage,
  decorators: [PageDecorator],
  args: { routePath: '/settings/domains/custom-domain' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsCustomDomainPage>;

export const Default: Story = {};

export const InvalidDomain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByRole('textbox', {}, { timeout: 5000 });

    await userEvent.clear(input);
    await userEvent.type(input, 'not-a-domain');

    const errorMessage = await canvas.findByText(/Invalid domain/);

    await expect(errorMessage).toBeVisible();

    const saveButton = canvas.getByText('Save');

    await expect(saveButton.closest('button')).toBeDisabled();
  },
};

export const ValidDomain: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = await canvas.findByRole('textbox', {}, { timeout: 5000 });

    await userEvent.clear(input);
    await userEvent.type(input, 'crm.example.com');

    const saveButton = canvas.getByText('Save');

    await expect(saveButton.closest('button')).toBeEnabled();
  },
};
