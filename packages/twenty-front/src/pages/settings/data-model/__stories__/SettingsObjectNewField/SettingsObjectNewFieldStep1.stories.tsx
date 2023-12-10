import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

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
  play: async () => {
    await sleep(100);
  },
};
