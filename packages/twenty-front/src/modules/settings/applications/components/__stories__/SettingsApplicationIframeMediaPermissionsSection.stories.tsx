import { SettingsApplicationIframeMediaPermissionsSection } from '@/settings/applications/components/SettingsApplicationIframeMediaPermissionsSection';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { isArray } from '@sniptt/guards';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { Toaster } from 'twenty-ui/components/feedback';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import {
  type ApproveApplicationIframeMediaPermissionsMutation,
  type ApproveApplicationIframeMediaPermissionsMutationVariables,
  type FindOneApplicationQuery,
  type FindOneApplicationQueryVariables,
} from '~/generated-metadata/graphql';

const APPLICATION_ID = '20202020-6a7b-4c3d-8e4f-000000000001';
const PHONE_ORIGIN = 'https://phone.example.com';
const VIDEO_ORIGIN = 'https://video.example.com';
const CONFIRMATION_MESSAGE =
  'Approve media access for Recorder?\nThis grants access to this app for everyone in your workspace.\nLet phone.example.com use your camera\nLet video.example.com use your microphone and camera';
const approveRequest = fn();
const refetchApplicationRequest = fn();

const APPROVED_PERMISSIONS = [
  { origin: PHONE_ORIGIN, microphone: false, camera: true },
  { origin: VIDEO_ORIGIN, microphone: true, camera: true },
];

const REFRESHED_APPLICATION: FindOneApplicationQuery['findOneApplication'] = {
  __typename: 'Application',
  id: APPLICATION_ID,
  name: 'Recorder',
  description: null,
  logoUrl: null,
  version: '1.1.0',
  universalIdentifier: APPLICATION_ID,
  applicationRegistrationId: null,
  applicationRegistration: null,
  canBeUninstalled: true,
  isUninstallBlockedByOtherWorkspaceInstallations: false,
  autoUpgrade: false,
  createdAt: '2026-11-02T00:00:00.000Z',
  defaultRoleId: null,
  settingsCustomTabFrontComponentId: null,
  healthCheckLogicFunctionId: null,
  availablePackages: {},
  requestedIframeMediaPermissions: [
    {
      __typename: 'IframeMediaPermission',
      origin: VIDEO_ORIGIN,
      microphone: true,
      camera: false,
    },
  ],
  grantedIframeMediaPermissions: [],
  applicationVariables: [],
  agents: [],
  frontComponents: [],
  commandMenuItems: [],
  settingsMenuItems: [],
  objects: [],
  logicFunctions: [],
};

const refetchApplicationHandler = graphql.query<
  FindOneApplicationQuery,
  FindOneApplicationQueryVariables
>('FindOneApplication', ({ variables }) => {
  refetchApplicationRequest(variables);

  return HttpResponse.json({
    data: { findOneApplication: REFRESHED_APPLICATION },
  });
});

const rejectedApprovalHandler = graphql.mutation(
  'ApproveApplicationIframeMediaPermissions',
  () =>
    HttpResponse.json({
      errors: [
        {
          message: 'Application permissions changed. Review them again.',
        },
      ],
    }),
);

const meta: Meta<typeof SettingsApplicationIframeMediaPermissionsSection> = {
  title:
    'Modules/Settings/Applications/SettingsApplicationIframeMediaPermissionsSection',
  component: SettingsApplicationIframeMediaPermissionsSection,
  decorators: [ToastDecorator, ComponentDecorator],
  args: {
    applicationId: APPLICATION_ID,
    applicationName: 'Recorder',
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
        refetchApplicationHandler,
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
      handlers: [rejectedApprovalHandler, refetchApplicationHandler],
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
      await waitFor(() => {
        expect(refetchApplicationRequest).toHaveBeenCalledTimes(1);
        expect(refetchApplicationRequest).toHaveBeenLastCalledWith({
          id: APPLICATION_ID,
        });
      });
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

export const ReportsFailedRefresh: Story = {
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster getToastProps={() => ({ progress: 100 })} />
      </>
    ),
  ],
  parameters: {
    msw: {
      handlers: [
        rejectedApprovalHandler,
        graphql.query('FindOneApplication', ({ variables }) => {
          refetchApplicationRequest(variables);

          return HttpResponse.json({
            errors: [
              {
                message: 'Application refresh failed.',
                extensions: {
                  userFriendlyMessage: 'Application refresh failed.',
                },
              },
            ],
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const confirm = spyOn(window, 'confirm').mockReturnValue(true);

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Review media access' }),
      );

      expect(
        await body.findByText('Application refresh failed.'),
      ).toBeVisible();
      expect(refetchApplicationRequest).toHaveBeenCalledTimes(1);
      expect(refetchApplicationRequest).toHaveBeenLastCalledWith({
        id: APPLICATION_ID,
      });
      expect(
        canvas.queryByRole('button', { name: 'Reload page' }),
      ).not.toBeInTheDocument();
    } finally {
      confirm.mockRestore();
    }
  },
};
