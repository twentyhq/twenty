import { playgroundApiKeyState } from '@/settings/mcp-and-apis/states/playgroundApiKeyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
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
  // Scalar renders an embedded API reference that manipulates browser history
  // and can reload the headless storybook test iframe. Exclude this
  // 3rd-party-tool wrapper from the vitest run; it remains available in
  // Storybook UI. (!test removes the auto-applied `test` tag.)
  tags: ['!test'],
  decorators: [
    (Story) => {
      jotaiStore.set(playgroundApiKeyState.atom, {
        token: 'test-api-key',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      });
      return <Story />;
    },
    ComponentDecorator,
    ComponentWithRouterDecorator,
  ],
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
