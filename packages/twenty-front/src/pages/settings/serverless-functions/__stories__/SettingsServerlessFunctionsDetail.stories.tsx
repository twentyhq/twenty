import { SettingsServerlessFunctionDetail } from '~/pages/settings/serverless-functions/SettingsServerlessFunctionDetail';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { Meta, StoryObj } from '@storybook/react';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { within } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';
import { getFileAbsoluteURI } from '~/utils/file/getFileAbsoluteURI';
import { sleep } from '~/utils/sleep';

const TEST_FILE_NAME = 'test-file.ts';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/ServerlessFunctions/SettingsServerlessFunctionDetail',
  component: SettingsServerlessFunctionDetail,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/functions/:serverlessFunctionId',
    routeParams: {
      ':serverlessFunctionId': 'f7c6d736-8fcd-4e9c-ab99-28f6a9031573',
    },
  },
  parameters: {
    mockData: [
      {
        url: getFileAbsoluteURI(TEST_FILE_NAME),
        method: 'GET',
        status: 200,
        response: {
          data: 'Hello storybook-addon-mock!',
        },
      },
    ],
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('GetOneServerlessFunction', () => {
          return HttpResponse.json({
            data: {
              serverlessFunction: {
                __typename: 'ServerlessFunction',
                id: 'f7c6d736-8fcd-4e9c-ab99-28f6a9031573',
                name: 'test',
                description: '',
                runtime: 'nodejs18.x',
                sourceCodeHash: '',
                sourceCodeFullPath: TEST_FILE_NAME,
                syncStatus: 'READY',
                createdAt: '2024-07-03T20:03:35.064Z',
                updatedAt: '2024-07-03T20:03:35.064Z',
              },
            },
          });
        }),
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
    await canvas.findByText('Editor');
    await canvas.findByText('Test');
    await canvas.findByText('Settings');
  },
};
