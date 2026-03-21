import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { SettingsCustomDomainPage } from '~/pages/settings/domains/SettingsCustomDomainPage';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Domains/SettingsCustomDomain',
  component: SettingsCustomDomainPage,
  decorators: [PageDecorator],
  args: { routePath: '/settings/domains/custom-domain' },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsCustomDomainPage>;

export const Default: Story = {};
