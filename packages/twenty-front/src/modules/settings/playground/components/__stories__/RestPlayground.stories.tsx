import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundConfig';
import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { RestPlayground } from '../RestPlayground';

const meta: Meta<typeof RestPlayground> = {
  title: 'Modules/Settings/Playground/RestPlayground',
  component: RestPlayground,
  decorators: [
    ComponentDecorator,
    I18nFrontDecorator,
    ComponentWithRecoilScopeDecorator,
  ],
  parameters: {
    docs: {
      description: {
        component:
          'RestPlayground provides an interactive environment to test REST API endpoints with authentication.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof RestPlayground>;

export const Default: Story = {
  args: {
    onError: action('REST Playground encountered unexpected error'),
    schema: PlaygroundSchemas.CORE,
  },
  parameters: {
    recoil: {
      atoms: {
        apiKeyState: 'test-api-key-123',
      },
    },
  },
};

export const Error: Story = {
  args: {
    onError: action('REST Playground encountered an error'),
    schema: PlaygroundSchemas.CORE,
  },
  parameters: {
    recoil: {
      atoms: {
        apiKeyState: null,
      },
    },
  },
};
