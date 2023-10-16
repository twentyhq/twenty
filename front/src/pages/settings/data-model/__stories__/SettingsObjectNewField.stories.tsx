import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsObjectNewField } from '../SettingsObjectNewField';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsObjectNewField',
  component: SettingsObjectNewField,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/objects/:pluralObjectName/new-field',
    routeParams: { ':pluralObjectName': 'companies' },
  },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsObjectNewField>;

export const Default: Story = {};
