import { type Meta, type StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import {
  ComponentDecorator,
  ComponentWithRouterDecorator,
} from 'twenty-ui/testing';
import { SettingsRestPlayground } from '~/pages/settings/developers/playground/SettingsRestPlayground';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof SettingsRestPlayground> = {
  title: 'Pages/Settings/Playground/RestPlayground',
  component: SettingsRestPlayground,
  decorators: [ComponentDecorator, ComponentWithRouterDecorator],
  parameters: {
    docs: {
      description: {
        component:
          'RestPlayground provides an interactive environment to test Open API queries with authentication.',
      },
    },
    msw: {
      handlers: graphqlMocks,
    },
  },
};
export default meta;

type Story = StoryObj<typeof SettingsRestPlayground>;

export const Default: Story = {
  args: {
    onError: action('Rest Playground encountered unexpected error'),
  },
};
