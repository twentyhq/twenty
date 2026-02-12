import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql, http } from 'msw';
import { within } from 'storybook/test';
import { getImageAbsoluteURI } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { SettingsLogicFunctionDetail } from '~/pages/settings/logic-functions/SettingsLogicFunctionDetail';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

const SOURCE_CODE_FULL_PATH =
  'logic-function/20202020-1c25-4d02-bf25-6aeccf7ea419/adb4bd21-7670-4c81-9f74-1fc196fe87ea/source.ts';

const APPLICATION_ID = '20202020-64aa-4b6f-b003-9c74b97cee20';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/LogicFunctions/SettingsLogicFunctionDetail',
  component: SettingsLogicFunctionDetail,
  decorators: [PageDecorator],
  args: {
    routePath:
      '/settings/applications/:applicationId/logicFunctions/:logicFunctionId',
    routeParams: {
      ':applicationId': APPLICATION_ID,
      ':logicFunctionId': 'adb4bd21-7670-4c81-9f74-1fc196fe87ea',
    },
  },
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.query('GetOneLogicFunction', () => {
          return HttpResponse.json({
            data: {
              logicFunction: {
                __typename: 'LogicFunction',
                id: 'adb4bd21-7670-4c81-9f74-1fc196fe87ea',
                applicationId: APPLICATION_ID,
                name: 'Logic Function Name',
                description: '',
                runtime: 'nodejs22.x',
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

export type Story = StoryObj<typeof SettingsLogicFunctionDetail>;

export const Default: Story = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await sleep(100);
    await canvas.findByText('Name and describe your function', undefined, {
      timeout: 3000,
    });
  },
};
