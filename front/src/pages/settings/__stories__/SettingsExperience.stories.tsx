import { Meta, StoryObj } from '@storybook/react';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsExperience } from '../SettingsExperience';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsExperience',
  component: SettingsExperience,
  decorators: [PageDecorator],
  args: { routePath: '/settings/experience' },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsExperience>;

export const Default: Story = {};
