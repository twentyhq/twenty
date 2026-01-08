import { getOperationName } from '@apollo/client/utilities';
import { type Meta, type StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/test';
import { HttpResponse, graphql } from 'msw';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
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
  title: 'Pages/Auth/SignInUp',
  component: SignInUpWithCaptcha,
  decorators: [PageDecorator],
  args: { routePath: AppPath.SignInUp },
  parameters: {
    msw: {
      handlers: [
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
    const continueWithEmailButton = await canvas.findByText(
      'Continue with Email',
      {},
      { timeout: 3000 },
    );

    await fireEvent.click(continueWithEmailButton);
  },
};
