import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';

import { SettingsDevelopersApiKeyDetail } from '~/pages/settings/developers/api-keys/SettingsDevelopersApiKeyDetail';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Developers/ApiKeys/SettingsDevelopersApiKeyDetail',
  component: SettingsDevelopersApiKeyDetail,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/apis/:apiKeyId',
    routeParams: {
      ':apiKeyId': 'f7c6d736-8fcd-4e9c-ab99-28f6a9031570',
    },
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneapiKey', () => {
          return HttpResponse.json({
            data: {
              apiKey: {
                id: 'f7c6d736-8fcd-4e9c-ab99-28f6a9031570',
                revokedAt: null,
                createdAt: '2021-08-27T12:00:00Z',
                expiresAt: '2021-08-27T12:00:00Z',
                name: 'My API Key',
                updatedAt: '2021-08-27T12:00:00Z',
                __typename: 'ApiKey',
              },
            },
          });
        }),
        graphqlMocks.handlers,
      ],
    },
  },
};
export default meta;

export type Story = StoryObj<typeof SettingsDevelopersApiKeyDetail>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Settings');
    await canvas.findByText('Regenerate an Api key');
  },
};
