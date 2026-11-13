import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, within } from 'storybook/test';

import { AppPath } from 'twenty-shared/types';
import { Authorize } from '~/pages/auth/Authorize';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getOperationName } from '~/utils/getOperationName';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
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
    isVerified?: boolean;
    isClaimingVerifiedClientName?: boolean;
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
                isVerified: false,
                isClaimingVerifiedClientName: false,
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
    await canvas.findByText('chatgpt.com');
  },
};

export const VerifiedClient: Story = {
  args: {
    searchParams: {
      client_id: 'twenty-cli-client-id',
      redirect_uri: 'http://localhost:53124/callback',
    },
  },
  parameters: {
    msw: {
      handlers: buildHandlers({
        id: 'application-id-twenty-cli',
        name: 'Twenty CLI',
        logoUrl: null,
        oAuthScopes: ['api', 'profile'],
        websiteUrl: null,
        isVerified: true,
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Connect Twenty CLI to your account', undefined, {
      timeout: 5000,
    });
    await canvas.findByText(
      'Registered with Twenty as the official Twenty CLI',
    );
  },
};

export const UnverifiedClientBorrowingAVerifiedName: Story = {
  args: {
    searchParams: {
      client_id: 'self-named-twenty-cli-client-id',
      redirect_uri: 'https://cli.example.com/callback',
    },
  },
  parameters: {
    msw: {
      handlers: buildHandlers({
        id: 'application-id-self-named-twenty-cli',
        name: 'Twenty CLI',
        logoUrl: null,
        oAuthScopes: ['api', 'profile'],
        websiteUrl: null,
        isClaimingVerifiedClientName: true,
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Connect Twenty CLI to your account', undefined, {
      timeout: 5000,
    });
    await canvas.findByText(
      'This app calls itself Twenty CLI, but Twenty could not confirm it is. Only continue if you started this connection from Twenty CLI.',
    );
    expect(
      canvas.queryByText(/Registered with Twenty as the official/),
    ).not.toBeInTheDocument();
  },
};

export const WhenTheClientLookupFails: Story = {
  args: {
    searchParams: {
      client_id: 'https://client.example.com/oauth/metadata.json',
      redirect_uri: MOCKED_REDIRECT_URL,
    },
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query(
          getOperationName(FindApplicationRegistrationByClientIdDocument) ?? '',
          () =>
            HttpResponse.json({
              data: null,
              errors: [
                {
                  message: 'Limit reached (60 tokens per 3600000 ms)',
                  extensions: { code: 'LIMIT_REACHED' },
                },
              ],
            }),
        ),
        ...buildHandlers(null),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(
      'Unable to load application details. Please try again later.',
      undefined,
      { timeout: 5000 },
    );
    expect(
      canvas.queryByText(`Navigated to ${AppPath.NotFound}`),
    ).not.toBeInTheDocument();
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

export const WithClaudeInWorkspace: Story = {
  args: {
    searchParams: {
      client_id: 'claude-client-id',
      redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
    },
  },
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      displayName: 'Acme',
      logo: null,
    });

    return () => {
      jotaiStore.set(currentWorkspaceState.atom, null);
    };
  },
  parameters: {
    msw: {
      handlers: buildHandlers({
        id: 'application-id-claude',
        name: 'Claude',
        logoUrl: null,
        oAuthScopes: ['api', 'profile'],
        websiteUrl: null,
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Connect Claude to Acme', undefined, {
      timeout: 5000,
    });
  },
};
