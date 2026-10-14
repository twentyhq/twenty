import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

import { SettingsObjectDetailPage } from '~/pages/settings/data-model/SettingsObjectDetailPage';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/DataModel/SettingsObjectDetail',
  component: SettingsObjectDetailPage,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:objectNamePlural',
    routeParams: { ':objectNamePlural': 'companies' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectDetailPage>;

export const StandardObject: Story = {
  play: async () => {
    await sleep(100);
  },
};

export const CustomObject: Story = {
  args: {
    routeParams: { ':objectNamePlural': 'myCustoms' },
  },
};

export const ObjectTabs: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const fieldsTab = await canvas.findByTestId('tab-fields');
    const settingsTab = await canvas.findByTestId('tab-settings');

    await expect(fieldsTab).toBeVisible();
    await expect(settingsTab).toBeVisible();
  },
};

export const SettingsTabLinks: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByTestId('tab-settings'));

    expect(
      await canvas.findByRole('link', { name: 'Configure search' }),
    ).toHaveAttribute('href', '/settings/objects/companies/object-search');
    expect(
      canvas.getByRole('link', { name: 'Manage indexes' }),
    ).toHaveAttribute('href', '/settings/objects/companies/object-indexes');
    expect(
      canvas.getByRole('link', { name: 'Edit translations' }),
    ).toHaveAttribute(
      'href',
      '/settings/objects/companies/object-translations',
    );
  },
};
