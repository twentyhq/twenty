import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { useEffect } from 'react';
import { fireEvent, within } from 'storybook/test';

import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { AppPath } from 'twenty-shared/types';
import { SignInUpV2 } from '~/pages/auth/SignInUpV2';

const CaptchaTokenSetterEffect = () => {
  const setCaptchaToken = useSetAtomState(captchaTokenState);

  useEffect(() => {
    setCaptchaToken('MOCKED_CAPTCHA_TOKEN');
  }, [setCaptchaToken]);

  return null;
};

const WorkspaceCreationStateSetterEffect = () => {
  const setSignInUpStep = useSetAtomState(signInUpStepState);
  const setIsMultiWorkspaceEnabled = useSetAtomState(
    isMultiWorkspaceEnabledState,
  );
  const setDomainConfiguration = useSetAtomState(domainConfigurationState);

  useEffect(() => {
    setSignInUpStep(SignInUpStep.WorkspaceCreation);
    setIsMultiWorkspaceEnabled(true);
    setDomainConfiguration({
      frontDomain: 'twenty.com',
      defaultSubdomain: 'app',
    });
  }, [setSignInUpStep, setIsMultiWorkspaceEnabled, setDomainConfiguration]);

  return null;
};

const SignInUpV2WithCaptcha = () => {
  return (
    <>
      <CaptchaTokenSetterEffect />
      <SignInUpV2 />
    </>
  );
};

const currentUserUnauthorizedHandler = graphql.query(
  getOperationName(GET_CURRENT_USER) ?? '',
  () => {
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
  },
);

const subdomainTakenHandler = graphql.query(
  'CheckWorkspaceSubdomainAvailability',
  () => {
    return HttpResponse.json({
      data: {
        checkWorkspaceSubdomainAvailability: {
          __typename: 'SubdomainAvailabilityDTO',
          isValid: true,
          available: false,
          suggestedSubdomain: 'acme-2',
          suggestedSubdomains: ['acme-2', 'acme-3', 'acme-4'],
        },
      },
    });
  },
);

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Auth/SignInUpV2',
  component: SignInUpV2WithCaptcha,
  decorators: [PageDecorator],
  args: { routePath: AppPath.SignInUpV2 },
  parameters: {
    msw: {
      handlers: [currentUserUnauthorizedHandler, graphqlMocks.handlers],
    },
    cookie: '',
  },
};

export default meta;

export type Story = StoryObj<typeof SignInUpV2WithCaptcha>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const continueWithEmailButton = await canvas.findByText(
      'Continue with Email',
      {},
      { timeout: 3000 },
    );

    await fireEvent.click(continueWithEmailButton);
  },
};

export const WorkspaceCreation: Story = {
  render: () => (
    <>
      <CaptchaTokenSetterEffect />
      <WorkspaceCreationStateSetterEffect />
      <SignInUpV2 />
    </>
  ),
  parameters: {
    msw: {
      handlers: [
        subdomainTakenHandler,
        currentUserUnauthorizedHandler,
        graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const subdomainInput = await canvas.findByPlaceholderText(
      'apple',
      {},
      { timeout: 3000 },
    );

    fireEvent.change(subdomainInput, { target: { value: 'acme' } });

    await canvas.findByText(
      'Subdomain already in use, here are some alternatives:',
      {},
      { timeout: 5000 },
    );
  },
};
