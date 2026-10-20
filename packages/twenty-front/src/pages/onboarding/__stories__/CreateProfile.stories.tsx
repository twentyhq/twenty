import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, spyOn, userEvent, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { AppPath } from 'twenty-shared/types';

import { OnboardingStatus } from '~/generated-metadata/graphql';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { CreateProfile } from '~/pages/onboarding/CreateProfile';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/CreateProfile',
  component: CreateProfile,
  decorators: [PageDecorator],
  args: { routePath: AppPath.CreateProfile },
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
