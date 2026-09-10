import { getOperationName } from '~/utils/getOperationName';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AppPath } from 'twenty-shared/types';

import { OnboardingStatus } from '~/generated-metadata/graphql';
import { GET_CURRENT_USER } from '~/modules/users/graphql/queries/getCurrentUser';
import { InviteTeam } from '~/pages/onboarding/InviteTeam';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedOnboardingUserData } from '~/testing/mock-data/users';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Onboarding/InviteTeam',
  component: InviteTeam,
  decorators: [PageDecorator],
  args: { routePath: AppPath.InviteTeam },
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
          return HttpResponse.json({
            data: {
              currentUser: mockedOnboardingUserData(
                OnboardingStatus.INVITE_TEAM,
              ),
            },
          });
        }),
        graphql.query('GetInviteSuggestions', () => {
          return HttpResponse.json({
            data: { getInviteSuggestions: [] },
          });
        }),
        graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof InviteTeam>;

const findEmailInputs = (canvas: ReturnType<typeof within>) =>
  canvas.findAllByPlaceholderText(/@apple\.com$/);

const getRemoveButtons = (canvasElement: HTMLElement) =>
  canvasElement.ownerDocument.body.querySelectorAll('.tabler-icon-x');

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await canvas.findByText('Invite your team');
  },
};

export const RemovesAllInputsButTheLast: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await canvas.findByText('Invite your team');
    await waitFor(async () =>
      expect(await findEmailInputs(canvas)).toHaveLength(3),
    );

    expect(getRemoveButtons(canvasElement)).toHaveLength(3);

    await userEvent.click(getRemoveButtons(canvasElement)[2]);
    await waitFor(async () =>
      expect(await findEmailInputs(canvas)).toHaveLength(2),
    );
    expect(getRemoveButtons(canvasElement)).toHaveLength(2);

    await userEvent.click(getRemoveButtons(canvasElement)[1]);
    await waitFor(async () =>
      expect(await findEmailInputs(canvas)).toHaveLength(1),
    );
    await waitFor(() =>
      expect(getRemoveButtons(canvasElement)).toHaveLength(0),
    );
  },
};
