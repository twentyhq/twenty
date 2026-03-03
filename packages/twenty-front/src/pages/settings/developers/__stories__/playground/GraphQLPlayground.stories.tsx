import { playgroundApiKeyState } from '@/settings/playground/states/playgroundApiKeyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import {
  ComponentDecorator,
  ComponentWithRouterDecorator,
} from 'twenty-ui/testing';
import { SettingsGraphQLPlayground } from '~/pages/settings/developers/playground/SettingsGraphQLPlayground';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<any> = {
  title: 'Pages/Settings/Playground/GraphQLPlayground',
  component: SettingsGraphQLPlayground,
  decorators: [
    (Story) => {
      jotaiStore.set(playgroundApiKeyState.atom, 'test-api-key');
      return <Story />;
    },
    ComponentDecorator,
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
