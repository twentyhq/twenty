import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsCustomDomain } from '~/pages/settings/domains/SettingsCustomDomain';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Domains/SettingsCustomDomain',
  component: SettingsCustomDomain,
  decorators: [PageDecorator],
  args: { routePath: '/settings/domains/custom-domain' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsCustomDomain>;

export const Default: Story = {};
