import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsSubdomain } from '~/pages/settings/domains/SettingsSubdomain';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Domains/SettingsSubdomain',
  component: SettingsSubdomain,
  decorators: [PageDecorator],
  args: { routePath: '/settings/domains/subdomain' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsSubdomain>;

export const Default: Story = {};
