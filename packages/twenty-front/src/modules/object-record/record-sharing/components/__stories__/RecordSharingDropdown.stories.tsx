import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { MockedProvider } from '@apollo/client/testing/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { RecordSharingDropdown } from '@/object-record/record-sharing/components/RecordSharingDropdown';
import { GetRecordSharingDocument } from '~/generated-metadata/graphql';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const TARGET = { objectMetadataId: 'note', recordId: 'shared-note' };

const SharingStory = ({
  enabled = true,
  fails = false,
  loading = false,
}: {
  enabled?: boolean;
  fails?: boolean;
  loading?: boolean;
}) => {
  const [store] = useState(() => {
    const store = createStore();
    const members = [
      {
        id: 'owner',
        name: { firstName: 'Alex', lastName: 'Morgan' },
        userEmail: 'alex@example.com',
      },
      {
        id: 'member',
        name: { firstName: 'Phil', lastName: 'Schiler' },
        userEmail: 'phil@example.com',
      },
      {
        id: 'invite',
        name: { firstName: 'Jane', lastName: 'Austen' },
        userEmail: 'jane.austen@example.com',
      },
      {
        id: 'long',
        name: { firstName: 'Alexandra', lastName: 'Montgomery-Wellington' },
        userEmail: 'alexandra.montgomery.wellington@example.com',
      },
    ];
    store.set(currentWorkspaceMembersState.atom, members);
    store.set(currentWorkspaceMemberState.atom, {
      ...members[0],
      colorScheme: 'Light',
      locale: 'en',
    });
    return store;
  });
  return (
    <Provider store={store}>
      <MockedProvider
        mocks={[
          {
            request: {
              query: GetRecordSharingDocument,
              variables: { target: TARGET },
            },
            maxUsageCount: Infinity,
            delay: loading ? Infinity : 0,
            ...(fails
              ? { error: new Error('Sharing unavailable') }
              : {
                  result: {
                    data: {
                      recordSharing: {
                        __typename: 'RecordSharingDTO',
                        isEnabled: enabled,
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
                            principalId: 'owner',
                            principalType: 'WORKSPACE_MEMBER',
                            rowCause: 'OWNER',
                            accessLevel: 'FULL',
                          },
                          {
                            __typename: 'RecordSharingGrantDTO',
                            id: 'member-grant',
                            principalId: 'member',
                            principalType: 'WORKSPACE_MEMBER',
                            rowCause: 'MANUAL',
                            accessLevel: 'READ_WRITE',
                          },
                          {
                            __typename: 'RecordSharingGrantDTO',
                            id: 'role-grant',
                            principalId: 'sales',
                            principalType: 'ROLE',
                            rowCause: 'MANUAL',
                            accessLevel: 'READ',
                          },
                        ],
                        roles: [
                          {
                            __typename: 'RecordSharingRoleDTO',
                            id: 'sales',
                            label: 'Sales',
                          },
                        ],
                      },
                    },
                  },
                }),
          },
        ]}
      >
        <RecordSharingDropdown
          target={TARGET}
          title="Share note"
          recordUrl="https://example.com/note/shared-note"
        />
      </MockedProvider>
    </Provider>
  );
};

const meta = {
  title: 'Modules/ObjectRecord/RecordSharingDropdown',
  component: RecordSharingDropdown,
  args: {
    target: TARGET,
    title: 'Share note',
    recordUrl: 'https://example.com/note/shared-note',
  },
  decorators: [ComponentDecorator, ToastDecorator],
  parameters: { container: { width: 600, height: 600 } },
} satisfies Meta<typeof RecordSharingDropdown>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Enabled: Story = {
  render: () => <SharingStory />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await page.findByRole('button', { name: 'Share', expanded: false }),
    );
    await waitFor(() => expect(page.getByText('Share note')).toBeVisible());
    await expect(
      page.getByRole('menuitem', { name: 'Restricted' }),
    ).toBeVisible();
    await expect(page.getByText('Copy link')).toBeVisible();
    await userEvent.click(
      page.getByRole('menuitem', { name: 'Add people or roles' }),
    );
    await userEvent.click(
      page.getByRole('button', { name: 'Invitation access' }),
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Editor' }),
    );
    await userEvent.keyboard('{Escape}');
    await expect(
      page.getByRole('button', { name: 'Invitation access' }),
    ).toHaveTextContent('Editor');
    await expect(page.getByText('Share note')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByText('Share note')).not.toBeInTheDocument(),
    );
  },
};

export const Unavailable: Story = {
  render: () => <SharingStory enabled={false} />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await waitFor(() =>
      expect(
        page.queryByRole('button', { name: 'Share' }),
      ).not.toBeInTheDocument(),
    );
    await expect(page.queryByText('Share note')).not.toBeInTheDocument();
  },
};

export const UnknownAvailability: Story = {
  render: () => <SharingStory loading />,
  play: Unavailable.play,
};

export const FailedAvailability: Story = {
  render: () => <SharingStory fails />,
  play: Unavailable.play,
};
