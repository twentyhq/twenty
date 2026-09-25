import { MockedProvider } from '@apollo/client/testing/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatSharingDropdown } from '@/ai/components/AiChatSharingDropdown';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RecordSharingDropdown } from '@/object-record/record-sharing/components/RecordSharingDropdown';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FeatureFlagKey,
  GetRecordSharingDocument,
} from '~/generated-metadata/graphql';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const THREAD_METADATA = {
  ...getMockObjectMetadataItemOrThrow('note'),
  nameSingular: 'agentChatThread',
  namePlural: 'agentChatThreads',
};
const THREAD_ID = 'shared-thread';
const NOTE_TARGET = { objectMetadataId: 'note', recordId: 'shared-note' };
const sharingResponse = fn((isEnabled: boolean) => ({
  data: {
    recordSharing: {
      __typename: 'RecordSharingDTO',
      isEnabled,
      hasInheritedAccess: false,
      viewerAccessLevel: 'FULL',
      permissions: {
        __typename: 'RecordPermissionsDTO',
        canRead: true,
        canUpdate: true,
        canDelete: false,
        canSoftDelete: false,
      },
      shares: [
        {
          __typename: 'RecordSharingGrantDTO',
          id: 'owner-grant',
          principalId: mockedWorkspaceMemberData.id,
          principalType: 'WORKSPACE_MEMBER',
          rowCause: 'OWNER',
          accessLevel: 'FULL',
        },
      ],
      roles: [],
    },
  },
}));

const setDropdownFlag = (enabled?: boolean) => {
  jotaiStore.set(currentWorkspaceState.atom, (workspace) => ({
    ...mockCurrentWorkspace,
    ...workspace,
    featureFlags: [
      ...(workspace?.featureFlags ?? []).filter(
        ({ key }) => key !== FeatureFlagKey.IS_AI_CHAT_SHARING_DROPDOWN_ENABLED,
      ),
      ...(isDefined(enabled)
        ? [
            {
              key: FeatureFlagKey.IS_AI_CHAT_SHARING_DROPDOWN_ENABLED,
              value: enabled,
            },
          ]
        : []),
    ],
  }));
};

type SharingStoryProps = {
  isBackendEnabled: boolean;
  isDropdownEnabled?: boolean;
  isChat: boolean;
};

const SharingStory = ({ isBackendEnabled, isChat }: SharingStoryProps) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GetRecordSharingDocument,
          variables: {
            target: isChat
              ? { objectMetadataId: THREAD_METADATA.id, recordId: THREAD_ID }
              : NOTE_TARGET,
          },
        },
        maxUsageCount: Infinity,
        delay: 0,
        result: () => sharingResponse(isBackendEnabled),
      },
    ]}
  >
    {isChat ? (
      <AiChatSharingDropdown threadId={THREAD_ID} />
    ) : (
      <RecordSharingDropdown
        target={NOTE_TARGET}
        title="Share note"
        recordUrl="https://example.com/note/shared-note"
      />
    )}
  </MockedProvider>
);

const meta = {
  title: 'Modules/AI/AiChatSharingDropdown',
  component: SharingStory,
  decorators: [ComponentDecorator, ToastDecorator],
  parameters: { container: { width: 600, height: 600 } },
  args: { isBackendEnabled: true, isDropdownEnabled: true, isChat: true },
  beforeEach: ({ args }) => {
    sharingResponse.mockClear();
    setTestObjectMetadataItemsInMetadataStore(jotaiStore, [THREAD_METADATA]);
    jotaiStore.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      mockedWorkspaceMemberData,
    ]);
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        {
          key: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
          value: args.isBackendEnabled,
        },
      ],
    });
    setDropdownFlag(args.isDropdownEnabled);
  },
} satisfies Meta<typeof SharingStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Enabled: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(await page.findByRole('button', { name: 'Share' }));
    await expect(
      await page.findByRole('menu', { name: 'Share conversation' }),
    ).toBeVisible();
    await expect(
      await page.findByRole('menuitem', { name: 'Restricted' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'You Owner' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Copy link' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const Disabled: Story = {
  args: { isDropdownEnabled: false },
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(
      page.queryByRole('button', { name: 'Share' }),
    ).not.toBeInTheDocument();
    setDropdownFlag(true);
    await page.findByRole('button', { name: 'Share' });
    setDropdownFlag(args.isDropdownEnabled);
    await waitFor(() =>
      expect(
        page.queryByRole('button', { name: 'Share' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const MissingFlag: Story = {
  args: { isDropdownEnabled: undefined },
  play: Disabled.play,
};

export const BackendDisabled: Story = {
  args: { isBackendEnabled: false },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(sharingResponse).toHaveBeenCalledWith(false));
    await expect(
      page.queryByRole('button', { name: 'Share' }),
    ).not.toBeInTheDocument();
  },
};

export const OtherObjectsRemainAvailable: Story = {
  args: { isChat: false, isDropdownEnabled: false },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(await page.findByRole('button', { name: 'Share' }));
    await expect(
      await page.findByRole('menu', { name: 'Share note' }),
    ).toBeVisible();
    await expect(
      await page.findByRole('menuitem', { name: 'Restricted' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const DisableWhileOpen: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(await page.findByRole('button', { name: 'Share' }));
    await expect(
      await page.findByRole('menu', { name: 'Share conversation' }),
    ).toBeVisible();
    setDropdownFlag(false);
    await waitFor(() => {
      expect(
        page.queryByRole('button', { name: 'Share' }),
      ).not.toBeInTheDocument();
      expect(
        page.queryByRole('menu', { name: 'Share conversation' }),
      ).not.toBeInTheDocument();
    });
    setDropdownFlag(true);
    const trigger = await page.findByRole('button', {
      name: 'Share',
      expanded: false,
    });
    await userEvent.click(trigger);
    await expect(
      await page.findByRole('menu', { name: 'Share conversation' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        page.queryByRole('menu', { name: 'Share conversation' }),
      ).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  },
};
