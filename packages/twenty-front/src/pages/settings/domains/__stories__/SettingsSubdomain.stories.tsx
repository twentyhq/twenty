import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsSubdomainPage } from '~/pages/settings/domains/SettingsSubdomainPage';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Domains/SettingsSubdomain',
  component: SettingsSubdomainPage,
  decorators: [PageDecorator],
  args: { routePath: '/settings/domains/subdomain' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsSubdomainPage>;

export const Default: Story = {};
