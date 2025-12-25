import { getOperationName } from '@apollo/client/utilities';
import { type Meta, type StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/test';
import { HttpResponse, graphql } from 'msw';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { GET_WORKSPACE_FROM_INVITE_HASH } from '@/workspace/graphql/queries/getWorkspaceFromInviteHash';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { AppPath } from 'twenty-shared/types';
import { SignInUp } from '~/pages/auth/SignInUp';

const CaptchaTokenSetterEffect = () => {
  const setCaptchaToken = useSetRecoilState(captchaTokenState);

  useEffect(() => {
    setCaptchaToken('MOCKED_CAPTCHA_TOKEN');
  }, [setCaptchaToken]);

  return null;
};

const SignInUpWithCaptcha = () => {
  return (
    <>
      <CaptchaTokenSetterEffect />
      <SignInUp />
    </>
  );
};

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Auth/Invite',
  component: SignInUpWithCaptcha,
  decorators: [PageDecorator],
  args: {
    routePath: AppPath.Invite,
    routeParams: { ':workspaceInviteHash': 'my-hash' },
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query(
          getOperationName(GET_WORKSPACE_FROM_INVITE_HASH) ?? '',
          () => {
            return HttpResponse.json({
              data: {
                findWorkspaceFromInviteHash: {
                  __typename: 'Workspace',
                  id: '20202020-91f0-46d0-acab-cb5afef3cc3b',
                  displayName: 'Twenty dev',
                  logo: null,
                  allowImpersonation: false,
                },
              },
            });
          },
        ),
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
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
          });
        }),
        graphqlMocks.handlers,
      ],
    },
    cookie: '',
  },
};

export default meta;

export type Story = StoryObj<typeof SignInUpWithCaptcha>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Join Twenty dev team', undefined, {
      timeout: 5000,
    });

    const continueWithEmailButton = await canvas.findByText(
      'Continue with Email',
    );

    await fireEvent.click(continueWithEmailButton);
  },
};
