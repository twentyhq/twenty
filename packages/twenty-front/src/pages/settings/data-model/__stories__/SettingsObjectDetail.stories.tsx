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
    routePath: '/settings/objects/:objectSlug',
    routeParams: { ':objectSlug': 'companies' },
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
    routeParams: { ':objectSlug': 'my-customs' },
  },
};

export const ObjectDropdownMenu: Story = {
  play: async () => {
    const canvas = within(document.body);
    const objectSummaryVerticalDotsIconButton = await canvas.findByRole(
      'button',
      {
        name: 'Object Options',
      },
    );

    await userEvent.click(objectSummaryVerticalDotsIconButton);

    await canvas.findByText('Edit');
    await canvas.findByText('Deactivate');
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
