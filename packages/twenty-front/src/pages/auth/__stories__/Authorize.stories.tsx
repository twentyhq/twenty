import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { within } from 'storybook/test';

import { AppPath } from 'twenty-shared/types';
import { Authorize } from '~/pages/auth/Authorize';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getOperationName } from '~/utils/getOperationName';

import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { FindApplicationRegistrationByClientIdDocument } from '~/generated-metadata/graphql';

const MOCKED_REDIRECT_URL = 'https://chatgpt.com/connector';

const buildHandlers = (
  application: {
    id: string;
    name: string;
    logoUrl: string | null;
    oAuthScopes: string[];
    websiteUrl: string | null;
  } | null,
) => [
  graphql.query(
    getOperationName(FindApplicationRegistrationByClientIdDocument) ?? '',
    () =>
      HttpResponse.json({
        data: {
          findApplicationRegistrationByClientId: application
            ? {
                __typename: 'PublicApplicationRegistration',
                ...application,
              }
            : null,
        },
      }),
  ),
  graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () =>
    HttpResponse.json({
      data: null,
      errors: [
        {
          message: 'Unauthorized',
          extensions: {
            code: 'UNAUTHENTICATED',
            response: {
              statusCode: 401,
              message: 'Unauthorized',
            },
          },
        },
      ],
    }),
  ),
  ...graphqlMocks.handlers,
];

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Auth/Authorize',
  component: Authorize,
  decorators: [PageDecorator],
  args: {
    routePath: AppPath.Authorize,
    routeParams: {},
    additionalRoutes: [AppPath.NotFound],
  },
  parameters: {
    cookie: '',
  },
};

export default meta;

export type Story = StoryObj<typeof Authorize>;

export const Default: Story = {
  args: {
    searchParams: {
      client_id: 'default-client-id',
      redirect_uri: MOCKED_REDIRECT_URL,
      state: 'mocked-state',
    },
  },
  parameters: {
    msw: {
      handlers: buildHandlers({
        id: 'application-id-default',
        name: 'ChatGPT',
        logoUrl: null,
        oAuthScopes: ['api', 'profile'],
        websiteUrl: null,
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Connect ChatGPT to your account', undefined, {
      timeout: 5000,
    });
  },
};

export const WithApiScopeOnly: Story = {
  args: {
    searchParams: {
      client_id: 'api-only-client-id',
      redirect_uri: MOCKED_REDIRECT_URL,
    },
  },
  parameters: {
    msw: {
      handlers: buildHandlers({
        id: 'application-id-api-only',
        name: 'Internal Tool',
        logoUrl: null,
        oAuthScopes: ['api'],
        websiteUrl: null,
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(
      'Connect Internal Tool to your account',
      undefined,
      { timeout: 5000 },
    );
  },
};

export const WithLongAppName: Story = {
  args: {
    searchParams: {
      client_id: 'long-name-client-id',
      redirect_uri: MOCKED_REDIRECT_URL,
    },
  },
  parameters: {
    msw: {
      handlers: buildHandlers({
        id: 'application-id-long-name',
        name: 'Custom Workspace Automation Suite',
        logoUrl: null,
        oAuthScopes: ['api', 'profile'],
        websiteUrl: null,
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(
      'Connect Custom Workspace Automation Suite to your account',
      undefined,
      { timeout: 5000 },
    );
  },
};
