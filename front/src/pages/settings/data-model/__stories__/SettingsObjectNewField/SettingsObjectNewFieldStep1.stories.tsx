import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsObjectNewFieldStep1 } from '../../SettingsObjectNewField/SettingsObjectNewFieldStep1';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsObjectNewField/SettingsObjectNewFieldStep1',
  component: SettingsObjectNewFieldStep1,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:pluralObjectName/new-field/step-1',
    routeParams: { ':pluralObjectName': 'companies' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectNewFieldStep1>;

export const Default: Story = {};
