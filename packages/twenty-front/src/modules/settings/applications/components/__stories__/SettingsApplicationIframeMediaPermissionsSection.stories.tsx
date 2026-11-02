import { SettingsApplicationIframeMediaPermissionsSection } from '@/settings/applications/components/SettingsApplicationIframeMediaPermissionsSection';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { isArray } from '@sniptt/guards';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
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
    const body = within(canvasElement.ownerDocument.body);
    const reviewButton = canvas.getByRole('button', {
      name: 'Review media access',
    });

    await userEvent.click(reviewButton);

    const firstDialog = await body.findByRole('dialog', {
      name: 'Approve media access for Recorder?',
    });

    expect(
      within(firstDialog).getByText('Let phone.example.com use your camera'),
    ).toBeVisible();
    expect(
      within(firstDialog).getByText(
        'Let video.example.com use your microphone and camera',
      ),
    ).toBeVisible();
    expect(approveRequest).not.toHaveBeenCalled();

    await userEvent.click(
      within(firstDialog).getByRole('button', { name: 'Cancel' }),
    );
    await waitFor(() => expect(firstDialog).not.toBeInTheDocument());
    expect(approveRequest).not.toHaveBeenCalled();

    await userEvent.click(reviewButton);

    const dialog = await body.findByRole('dialog', {
      name: 'Approve media access for Recorder?',
    });

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Approve media access' }),
    );
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
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Review media access' }),
    );

    const dialog = await body.findByRole('dialog', {
      name: 'Approve media access for Recorder?',
    });

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Approve media access' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(refetchApplicationRequest).toHaveBeenCalledTimes(1);
    expect(
      canvas.queryByRole('button', { name: 'Reload page' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.getByRole('button', { name: 'Review media access' }),
    ).toBeEnabled();
  },
};
