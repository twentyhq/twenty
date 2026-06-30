import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { within } from 'storybook/test';
import { AppPath } from 'twenty-shared/types';

import { isOnboardingV2State } from '@/auth/states/isOnboardingV2State';
import { FIND_MANY_MARKETPLACE_APPS } from '@/marketplace/graphql/queries/findManyMarketplaceApps';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import { GET_CURRENT_USER } from '~/modules/users/graphql/queries/getCurrentUser';
import { InstallAppsV2 } from '~/pages/onboarding/InstallAppsV2';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/InstallAppsV2',
  component: InstallAppsV2,
  decorators: [
    (Story) => {
      jotaiStore.set(isOnboardingV2State.atom, true);

      return <Story />;
    },
    PageDecorator,
  ],
  args: { routePath: AppPath.InstallAppsV2 },
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
            data: {
              currentUser: mockedOnboardingUserData(
                OnboardingStatus.APPS_INSTALLATION,
              ),
            },
          });
        }),
        graphql.query(
          getOperationName(FIND_MANY_MARKETPLACE_APPS) ?? '',
          () => {
            return HttpResponse.json({
              data: { findManyMarketplaceApps: [] },
            });
          },
        ),
        graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof InstallAppsV2>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Install your first apps');
  },
};
