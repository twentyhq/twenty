import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsObjectDetail } from '../SettingsObjectDetail';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsObjectDetail',
  component: SettingsObjectDetail,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:pluralObjectName',
    routeParams: { ':pluralObjectName': 'companies' },
  },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectDetail>;

export const Default: Story = {};
