import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsObjectNewFieldStep1 } from '../../SettingsObjectNewField/SettingsObjectNewFieldStep1';

const meta: Meta<PageDecoratorArgs> = {
  title:
    'Pages/Settings/DataModel/SettingsObjectNewField/SettingsObjectNewFieldStep1',
  component: SettingsObjectNewFieldStep1,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:objectSlug/new-field/step-1',
    routeParams: { ':objectSlug': 'companies' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectNewFieldStep1>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Settings');
    await canvas.findByText('Objects');
    await canvas.findByText('Companies');
    await canvas.findByText('Check disabled fields');
    await canvas.findByText('Add Custom Field');
  },
};
