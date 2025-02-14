import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { HttpResponse, graphql, http } from 'msw';
import { getImageAbsoluteURI } from 'twenty-shared';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { SettingsServerlessFunctionDetail } from '~/pages/settings/serverless-functions/SettingsServerlessFunctionDetail';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

const SOURCE_CODE_FULL_PATH =
  'serverless-function/20202020-1c25-4d02-bf25-6aeccf7ea419/adb4bd21-7670-4c81-9f74-1fc196fe87ea/source.ts';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/ServerlessFunctions/SettingsServerlessFunctionDetail',
  component: SettingsServerlessFunctionDetail,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/function/',
    routeParams: {
      ':serverlessFunctionId': 'adb4bd21-7670-4c81-9f74-1fc196fe87ea',
    },
  },
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('GetOneServerlessFunction', () => {
          return HttpResponse.json({
            data: {
              serverlessFunction: {
                __typename: 'ServerlessFunction',
                id: 'adb4bd21-7670-4c81-9f74-1fc196fe87ea',
                name: 'Serverless Function Name',
                description: '',
                syncStatus: 'READY',
                runtime: 'nodejs18.x',
                updatedAt: '2024-02-24T10:23:10.673Z',
                createdAt: '2024-02-24T10:23:10.673Z',
              },
            },
          });
        }),
        http.get(
          getImageAbsoluteURI({
            imageUrl: SOURCE_CODE_FULL_PATH,
            baseUrl: REACT_APP_SERVER_BASE_URL,
          }) || '',
          () => {
            return HttpResponse.text('export const handler = () => {}');
          },
        ),
      ],
    },
  },
};
export default meta;

export type Story = StoryObj<typeof SettingsServerlessFunctionDetail>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await sleep(100);
    await canvas.findByText('Code your function');
  },
};
