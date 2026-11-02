import { SettingsApplicationIframeMediaPermissionsSection } from '@/settings/applications/components/SettingsApplicationIframeMediaPermissionsSection';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { isArray } from '@sniptt/guards';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import {
  type ApproveApplicationIframeMediaPermissionsMutation,
  type ApproveApplicationIframeMediaPermissionsMutationVariables,
} from '~/generated-metadata/graphql';

const APPLICATION_ID = '20202020-6a7b-4c3d-8e4f-000000000001';
const PHONE_ORIGIN = 'https://phone.example.com';
const VIDEO_ORIGIN = 'https://video.example.com';
const CONFIRMATION_MESSAGE =
  'Approve media access for Recorder?\nThis grants access to this app for everyone in your workspace.\nLet phone.example.com use your camera\nLet video.example.com use your microphone and camera';
const approveRequest = fn();
const refetchApplicationRequest = fn().mockResolvedValue(undefined);

const APPROVED_PERMISSIONS = [
  { origin: PHONE_ORIGIN, microphone: false, camera: true },
  { origin: VIDEO_ORIGIN, microphone: true, camera: true },
];

const meta: Meta<typeof SettingsApplicationIframeMediaPermissionsSection> = {
  title:
    'Modules/Settings/Applications/SettingsApplicationIframeMediaPermissionsSection',
  component: SettingsApplicationIframeMediaPermissionsSection,
  decorators: [ToastDecorator, ComponentDecorator],
  args: {
    applicationId: APPLICATION_ID,
    applicationName: 'Recorder',
    onRefetchApplication: refetchApplicationRequest,
    requestedPermissions: [
      { origin: PHONE_ORIGIN, microphone: true, camera: true },
      { origin: VIDEO_ORIGIN, microphone: true, camera: true },
    ],
    grantedPermissions: [
      { origin: PHONE_ORIGIN, microphone: true, camera: false },
    ],
  },
  beforeEach: async () => {
    approveRequest.mockClear();
    refetchApplicationRequest.mockClear();
    await mockedApolloClient.clearStore();
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation<
          ApproveApplicationIframeMediaPermissionsMutation,
          ApproveApplicationIframeMediaPermissionsMutationVariables
        >('ApproveApplicationIframeMediaPermissions', ({ variables }) => {
          approveRequest(variables);
          const approvedPermissions = isArray(
            variables.approvedIframeMediaPermissions,
          )
            ? variables.approvedIframeMediaPermissions
            : [variables.approvedIframeMediaPermissions];

          return HttpResponse.json({
            data: {
              approveApplicationIframeMediaPermissions: {
                __typename: 'Application',
                id: APPLICATION_ID,
                grantedIframeMediaPermissions: approvedPermissions.map(
                  (permission) => ({
                    __typename: 'IframeMediaPermission',
                    ...permission,
                  }),
                ),
              },
            },
          });
        }),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ApprovesOnlyReviewedAdditionalAccess: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reviewButton = canvas.getByRole('button', {
      name: 'Review media access',
    });
    const confirm = spyOn(window, 'confirm')
      .mockReturnValueOnce(false)
      .mockReturnValue(true);

    try {
      await userEvent.click(reviewButton);

      expect(confirm).toHaveBeenCalledTimes(1);
      expect(confirm).toHaveBeenLastCalledWith(CONFIRMATION_MESSAGE);
      expect(approveRequest).not.toHaveBeenCalled();

      await userEvent.click(reviewButton);

      expect(confirm).toHaveBeenCalledTimes(2);
      expect(confirm).toHaveBeenLastCalledWith(CONFIRMATION_MESSAGE);
      await waitFor(() => {
        expect(approveRequest).toHaveBeenCalledTimes(1);
        expect(approveRequest).toHaveBeenLastCalledWith({
          applicationId: APPLICATION_ID,
          approvedIframeMediaPermissions: APPROVED_PERMISSIONS,
        });
      });
      expect(await canvas.findByRole('status')).toHaveTextContent(
        'Reloading ends active calls and recordings.',
      );
      expect(canvas.getByRole('button', { name: 'Reload page' })).toBeVisible();
      expect(refetchApplicationRequest).not.toHaveBeenCalled();
    } finally {
      confirm.mockRestore();
    }
  },
};

export const DoesNotApplyRejectedApproval: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('ApproveApplicationIframeMediaPermissions', () =>
          HttpResponse.json({
            errors: [
              {
                message: 'Application permissions changed. Review them again.',
              },
            ],
          }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const confirm = spyOn(window, 'confirm').mockReturnValue(true);

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Review media access' }),
      );

      expect(confirm).toHaveBeenCalledWith(CONFIRMATION_MESSAGE);
      await waitFor(() =>
        expect(refetchApplicationRequest).toHaveBeenCalledTimes(1),
      );
      expect(
        canvas.queryByRole('button', { name: 'Reload page' }),
      ).not.toBeInTheDocument();
      expect(
        canvas.getByRole('button', { name: 'Review media access' }),
      ).toBeEnabled();
    } finally {
      confirm.mockRestore();
    }
  },
};
