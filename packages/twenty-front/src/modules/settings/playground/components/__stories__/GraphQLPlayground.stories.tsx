import { GraphQLPlayground } from '@/settings/playground/components/GraphQLPlayground';
import { playgroundApiKeyState } from '@/settings/playground/states/playgroundApiKeyState';
import { action } from '@storybook/addon-actions';
import { type Meta, type StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import {
  ComponentDecorator,
  ComponentWithRouterDecorator,
} from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const PlaygroundApiKeySetterEffect = () => {
  const setPlaygroundApiKey = useSetRecoilState(playgroundApiKeyState);

  useEffect(() => {
    setPlaygroundApiKey('test-api-key-123');
  }, [setPlaygroundApiKey]);

  return null;
};

const meta: Meta<typeof GraphQLPlayground> = {
  title: 'Modules/Settings/Playground/GraphQLPlayground',
  component: GraphQLPlayground,
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
