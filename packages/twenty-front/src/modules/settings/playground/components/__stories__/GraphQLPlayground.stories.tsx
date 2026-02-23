import { GraphQLPlayground } from '@/settings/playground/components/GraphQLPlayground';
import { playgroundApiKeyState } from '@/settings/playground/states/playgroundApiKeyState';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { action } from 'storybook/actions';
import {
  ComponentDecorator,
  ComponentWithRouterDecorator,
} from 'twenty-ui/testing';
import { graphqlMocks } from '~/testing/graphqlMocks';

const PlaygroundApiKeySetterEffect = () => {
  const setPlaygroundApiKey = useSetRecoilStateV2(playgroundApiKeyState);

  useEffect(() => {
    setPlaygroundApiKey('test-api-key-123');
  }, [setPlaygroundApiKey]);

  return null;
};

const meta: Meta<typeof GraphQLPlayground> = {
  title: 'Modules/Settings/Playground/GraphQLPlayground',
  component: GraphQLPlayground,
  decorators: [ComponentDecorator, ComponentWithRouterDecorator],
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

type Story = StoryObj<typeof GraphQLPlayground>;

export const Default: Story = {
  args: {
    onError: action('GraphQL Playground encountered unexpected error'),
  },
  decorators: [
    (Story) => (
      <>
        <PlaygroundApiKeySetterEffect />
        <Story />
      </>
    ),
  ],
};
