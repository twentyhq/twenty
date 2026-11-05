import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, within } from 'storybook/test';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { MinimalMetadataGate } from '@/metadata-store/components/MinimalMetadataGate';
import { IsMinimalMetadataReadyEffect } from '@/metadata-store/effect-components/IsMinimalMetadataReadyEffect';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const APP_CONTENT = 'App content';

const meta: Meta<typeof MinimalMetadataGate> = {
  title: 'Modules/MetadataStore/MinimalMetadataGate',
  component: MinimalMetadataGate,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <IsMinimalMetadataReadyEffect />
        <Routes>
          <Route element={<Story />}>
            <Route index element={<div>{APP_CONTENT}</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    ),
  ],
  beforeEach: () => {
    jotaiStore.set(isCookieAuthActiveState.atom, true);
    jotaiStore.set(currentUserState.atom, mockedUserData);
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    setTestObjectMetadataItemsInMetadataStore(jotaiStore, []);
    setTestViewsInMetadataStore(jotaiStore, []);
  },
};

export default meta;
type Story = StoryObj<typeof MinimalMetadataGate>;

export const OpensWithCachedRecordsPermissions: Story = {
  beforeEach: () => {
    jotaiStore.set(
      currentUserWorkspaceState.atom,
      mockedUserData.currentUserWorkspace,
    );
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(APP_CONTENT);
  },
};

export const WaitsForRecordsPermissionsOnLegacyCachedValue: Story = {
  beforeEach: () => {
    localStorage.setItem(
      currentUserWorkspaceState.key,
      JSON.stringify({
        permissionFlags: [],
        twoFactorAuthenticationMethodSummary: [],
        isImpersonating: false,
        objectsPermissions: [],
      }),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByText(APP_CONTENT)).not.toBeInTheDocument();

    jotaiStore.set(
      currentUserWorkspaceState.atom,
      mockedUserData.currentUserWorkspace,
    );

    await canvas.findByText(APP_CONTENT);
  },
};

export const DoesNotWaitOnUnprovisionedWorkspace: Story = {
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
    });
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(APP_CONTENT);
  },
};
