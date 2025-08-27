import { action } from '@storybook/addon-actions';
import { type Meta, type StoryObj } from '@storybook/react';
import { SettingsGraphQLPlayground } from '~/pages/settings/developers/playground/SettingsGraphQLPlayground';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  ComponentDecorator,
  ComponentWithRouterDecorator,
} from 'twenty-ui/testing';

const meta: Meta<any> = {
  title: 'Pages/Settings/Playground/GraphQLPlayground',
  component: SettingsGraphQLPlayground,
  decorators: [
    ComponentDecorator,
    I18nFrontDecorator,
    ComponentWithRouterDecorator,
  ],
  parameters: {
    docs: {
      description: {
        component:
          'GraphQLPlayground provides an interactive environment to test GraphQL queries with authentication.',
      },
    },
    msw: graphqlMocks,
  },
};
export default meta;

type Story = StoryObj<any>;

export const Default: Story = {
  args: {
    onError: action('GraphQL Playground encountered unexpected error'),
  },
};
