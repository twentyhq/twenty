import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator, ComponentWithRouterDecorator } from 'twenty-ui';
import { SettingsRestPlayground } from '~/pages/settings/developers/playground/SettingsRestPlayground';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import {
  getValidMockSession,
  PlaygroundDecorator,
} from '~/testing/decorators/PlaygroundDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof SettingsRestPlayground> = {
  title: 'Page/Settings/Playground/RestPlayground',
  component: SettingsRestPlayground,
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
  parameters: {
    session: getValidMockSession(),
  },
};

export const Error: Story = {
  args: {
    onError: action('Rest Playground encountered an error'),
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
