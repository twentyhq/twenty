import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

import { SettingsObjectNewFieldStep2 } from '../../SettingsObjectNewField/SettingsObjectNewFieldStep2';

const meta: Meta<PageDecoratorArgs> = {
  title:
    'Pages/Settings/DataModel/SettingsObjectNewField/SettingsObjectNewFieldStep2',
  component: SettingsObjectNewFieldStep2,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:objectSlug/new-field/step-2',
    routeParams: { ':objectSlug': 'companies' },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectNewFieldStep2>;

export const Default: Story = {
  play: async () => {
    await sleep(100);
  },
};
