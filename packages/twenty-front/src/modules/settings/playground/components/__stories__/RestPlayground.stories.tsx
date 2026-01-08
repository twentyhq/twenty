import { playgroundApiKeyState } from '@/settings/playground/states/playgroundApiKeyState';
import { PlaygroundSchemas } from '@/settings/playground/types/PlaygroundSchemas';
import { action } from '@storybook/addon-actions';
import { type Meta, type StoryObj } from '@storybook/react';
import { HttpResponse, http } from 'msw';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { RestPlayground } from '@/settings/playground/components/RestPlayground';

const PlaygroundApiKeySetterEffect = () => {
  const setPlaygroundApiKey = useSetRecoilState(playgroundApiKeyState);

  useEffect(() => {
    setPlaygroundApiKey('test-api-key-123');
  }, [setPlaygroundApiKey]);

  return null;
};

const openApiSpec = {
  openapi: '3.1.1',
  info: {
    title: 'Twenty Api',
    description:
      'This is a **Twenty REST/API** playground based on the **OpenAPI 3.1 specification**.',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
  ],
  paths: {
    '/companies': {
      get: {
        tags: ['Companies'],
        summary: 'List companies',
        operationId: 'listCompanies',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
                examples: {
                  'List of companies': {
                    value: [
                      { id: '1', name: 'Acme Corp' },
                      { id: '2', name: 'Globex Corporation' },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  },
};

const meta: Meta<typeof RestPlayground> = {
  title: 'Modules/Settings/Playground/RestPlayground',
  component: RestPlayground,
  decorators: [ComponentDecorator, I18nFrontDecorator],
  parameters: {
    docs: {
      description: {
        component:
          'RestPlayground provides an interactive environment to test REST API endpoints with authentication.',
      },
    },
    msw: {
      handlers: [
        http.get('*/open-api/*', () => {
          return HttpResponse.json(openApiSpec);
        }),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof RestPlayground>;

export const Default: Story = {
  args: {
    onError: (...args) => {
      action('REST Playground encountered unexpected error')(...args);
    },
    schema: PlaygroundSchemas.CORE,
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
