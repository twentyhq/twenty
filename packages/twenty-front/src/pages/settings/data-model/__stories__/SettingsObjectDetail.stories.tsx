import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

import { SettingsObjectDetailPage } from '../SettingsObjectDetailPage';

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
  play: async () => {
    const canvas = within(document.body);

    const fieldsTab = await canvas.findByTestId('tab-fields');
    const settingsTab = await canvas.findByTestId('tab-settings');

    await expect(fieldsTab).toBeVisible();
    await expect(settingsTab).toBeVisible();
  },
};

export const FieldDropdownMenu: Story = {
  play: async () => {
    const canvas = within(document.body);
    const [fieldVerticalDotsIconButton] = await canvas.findAllByRole('button', {
      name: 'Active Field Options',
    });

    await userEvent.click(fieldVerticalDotsIconButton);

    await canvas.findByText('View');
    await canvas.findByText('Deactivate');
  },
};
