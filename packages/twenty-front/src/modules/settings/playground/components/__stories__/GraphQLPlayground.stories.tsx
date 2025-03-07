import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator, ComponentWithRouterDecorator } from 'twenty-ui';
import { SettingsGraphQLPlayground } from '~/pages/settings/developers/playground/SettingsGraphQLPlayground';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import {
  getValidMockSession,
  PlaygroundDecorator,
} from '~/testing/decorators/PlaygroundDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<any> = {
  title: 'Modules/Settings/Playground/GraphQLPlayground',
  component: SettingsGraphQLPlayground,
  decorators: [
    ComponentDecorator,
    I18nFrontDecorator,
    ComponentWithRouterDecorator,
    PlaygroundDecorator,
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
  parameters: {
    session: getValidMockSession(),
  },
};

export const Error: Story = {
  args: {
    onError: action('GraphQL Playground encountered an error'),
  },
  parameters: {
    session: {
      apiKey: null,
      baseUrl: null,
      schema: null,
      isValid: false,
    },
  },
};
