import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { AppPath } from 'twenty-shared/types';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { CreateProfile } from '~/pages/onboarding/CreateProfile';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockedOnboardingUserData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/CreateProfile',
  component: CreateProfile,
  decorators: [PageDecorator],
  args: { routePath: AppPath.CreateProfile },
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      ...mockedWorkspaceMemberData,
      avatarUrl: null,
      name: { firstName: '', lastName: '' },
    });

    return () => {
      jotaiStore.set(currentWorkspaceMemberState.atom, null);
    };
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
            data: {
              currentUser: mockedOnboardingUserData(
                OnboardingStatus.PROFILE_CREATION,
              ),
            },
          });
        }),
        graphql.query('GetInviteSuggestions', () =>
          HttpResponse.json({ data: { getInviteSuggestions: [] } }),
        ),
        graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof CreateProfile>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Create profile');

    const uploadButton = await canvas.findByRole('button', {
      name: 'Upload profile picture',
    });
    const fileInput =
      uploadButton.parentElement?.querySelector<HTMLInputElement>(
        'input[type="file"]',
      );

    if (!isDefined(fileInput)) {
      throw new Error('Profile picture file input not found');
    }

    await waitFor(() => expect(uploadButton).toBeVisible());
    await expect(uploadButton).toHaveAttribute('type', 'button');
    await expect(uploadButton).toHaveStyle({ width: '32px', height: '32px' });
    await expect(fileInput).toHaveAttribute(
      'accept',
      'image/jpeg, image/png, image/gif',
    );
    const openFilePicker = spyOn(fileInput, 'click').mockImplementation(
      () => undefined,
    );

    try {
      await userEvent.click(uploadButton);
      await userEvent.keyboard('{Enter} ');
      await expect(openFilePicker).toHaveBeenCalledTimes(3);
    } finally {
      openFilePicker.mockRestore();
    }
  },
};
