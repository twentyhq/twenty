import { GraphQLPlayground } from '@/settings/mcp-and-apis/components/GraphQLPlayground';
import { playgroundApiKeyState } from '@/settings/mcp-and-apis/states/playgroundApiKeyState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type Environment } from 'monaco-editor';
import { useEffect } from 'react';
import { action } from 'storybook/actions';
import { ComponentDecorator } from 'twenty-ui/testing';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const PlaygroundApiKeySetterEffect = () => {
  const setPlaygroundApiKey = useSetAtomState(playgroundApiKeyState);

  useEffect(() => {
    setPlaygroundApiKey({
      token: 'test-api-key-123',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
  }, [setPlaygroundApiKey]);

  return null;
};

const inertWorkerUrl = URL.createObjectURL(
  new Blob([], { type: 'text/javascript' }),
);

const inertMonacoEnvironment: Environment = {
  getWorker: () => new Worker(inertWorkerUrl),
};

const meta: Meta<typeof GraphQLPlayground> = {
  title: 'Modules/Settings/Playground/GraphQLPlayground',
  component: GraphQLPlayground,
  decorators: [ComponentDecorator, ComponentWithRouterDecorator],
  // Monaco rethrows a worker load failure as an uncaught error; rendering doesn't need workers.
  beforeEach: () => {
    const appMonacoEnvironment = window.MonacoEnvironment;

    window.MonacoEnvironment = inertMonacoEnvironment;

    return () => {
      window.MonacoEnvironment = appMonacoEnvironment;
    };
  },
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
