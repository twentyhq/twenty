import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsSecurityIframeMediaPermissions } from '@/settings/security/components/SettingsSecurityIframeMediaPermissions';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  type UpdateWorkspaceIframeMediaPermissionsMutation,
  type UpdateWorkspaceIframeMediaPermissionsMutationVariables,
} from '~/generated-metadata/graphql';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedUserData } from '~/testing/mock-data/users';

const WORKSPACE_ID = 'iframe-media-settings-workspace';
const ORIGIN = 'https://workspace.aircall.io';
const saveRequest = fn();
let permissions: IframeMediaPermission[] = [];

const getUpdatedWorkspace =
  (): UpdateWorkspaceIframeMediaPermissionsMutation['updateWorkspaceIframeMediaPermissions'] => ({
    __typename: 'Workspace',
    id: WORKSPACE_ID,
    iframeMediaPermissions: permissions.map((permission) => ({
      __typename: 'IframeMediaPermission',
      ...permission,
    })),
  });

const meta: Meta<typeof SettingsSecurityIframeMediaPermissions> = {
  title: 'Modules/Settings/Security/IframeMediaPermissions',
  component: SettingsSecurityIframeMediaPermissions,
  decorators: [ToastDecorator, ComponentDecorator],
  beforeEach: () => {
    permissions = [];
    saveRequest.mockClear();
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockedUserData.currentWorkspace,
      workspaceCustomApplication:
        mockedUserData.currentWorkspace.workspaceCustomApplication ?? null,
      installedApplications: [],
      iframeMediaPermissions: [],
    });
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation<
          UpdateWorkspaceIframeMediaPermissionsMutation,
          UpdateWorkspaceIframeMediaPermissionsMutationVariables
        >('UpdateWorkspaceIframeMediaPermissions', ({ variables }) => {
          const permission = variables.input;
          saveRequest(permission);
          permissions = permissions.filter(
            (existingPermission) =>
              existingPermission.origin !== permission.origin,
          );

          if (permission.microphone || permission.camera) {
            permissions.push(permission);
          }

          return HttpResponse.json({
            data: {
              updateWorkspaceIframeMediaPermissions: getUpdatedWorkspace(),
            },
          });
        }),
      ],
    },
  },
};

export default meta;

export const ConfiguresMediaPermissions: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = within(
      canvas.getByRole('group', { name: 'Add embedded website' }),
    );
    const originInput = form.getByRole('textbox', { name: 'Website origin' });
    const addButton = form.getByRole('button', { name: 'Add website' });

    await waitFor(() => expect(originInput).toBeEnabled());
    await expect(addButton).toBeDisabled();
    await userEvent.type(originInput, 'http://workspace.aircall.io');
    await userEvent.click(addButton);
    await expect(
      form.getByText('Enter an HTTPS origin without a path or wildcard.'),
    ).toBeVisible();
    await expect(saveRequest).not.toHaveBeenCalled();

    await userEvent.clear(originInput);
    await userEvent.type(originInput, ORIGIN);
    await userEvent.click(addButton);

    const accessSelect = within(
      await canvas.findByRole('group', { name: `Media access for ${ORIGIN}` }),
    ).getByRole('button', { name: 'Microphone and camera' });
    await expect(saveRequest).toHaveBeenLastCalledWith({
      origin: ORIGIN,
      microphone: true,
      camera: true,
    });

    await waitFor(() => expect(accessSelect).toBeEnabled());
    await userEvent.click(accessSelect);
    await userEvent.click(
      await within(canvasElement.ownerDocument.body).findByRole('option', {
        name: 'Microphone only',
      }),
    );
    await waitFor(() =>
      expect(saveRequest).toHaveBeenLastCalledWith({
        origin: ORIGIN,
        microphone: true,
        camera: false,
      }),
    );
    await expect(
      await canvas.findByRole('button', { name: 'Microphone only' }),
    ).toBeVisible();

    const removeButton = canvas.getByRole('button', {
      name: `Remove media access for ${ORIGIN}`,
    });
    await waitFor(() => expect(removeButton).toBeEnabled());
    await userEvent.click(removeButton);
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Microphone only' }),
      ).not.toBeInTheDocument(),
    );
    await expect(saveRequest).toHaveBeenLastCalledWith({
      origin: ORIGIN,
      microphone: false,
      camera: false,
    });
  },
};
