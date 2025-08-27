import { action } from '@storybook/addon-actions';
import { type Meta, type StoryObj } from '@storybook/react';
import { SettingsRestPlayground } from '~/pages/settings/developers/playground/SettingsRestPlayground';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  ComponentDecorator,
  ComponentWithRouterDecorator,
} from 'twenty-ui/testing';

const meta: Meta<typeof SettingsRestPlayground> = {
  title: 'Pages/Settings/Playground/RestPlayground',
  component: SettingsRestPlayground,
  decorators: [
    ComponentDecorator,
    I18nFrontDecorator,
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
