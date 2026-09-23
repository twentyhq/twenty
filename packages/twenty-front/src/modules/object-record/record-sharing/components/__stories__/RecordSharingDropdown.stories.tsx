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
  const [store] = useState(createStore);
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
                        shares: [],
                        roles: [],
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
          description="Viewers can read this note. Editors can make changes and share it."
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
    description:
      'Viewers can read this note. Editors can make changes and share it.',
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
    await expect(await page.findByText('Share note')).toBeVisible();
    await expect(page.getByText('Everyone in the workspace')).toBeVisible();
    await expect(page.getByText('Copy link')).toBeVisible();
    const invitation = within(
      page.getByRole('group', { name: 'Invitation access' }),
    );
    await userEvent.click(invitation.getByText('Viewer'));
    await userEvent.click(await page.findByText('Editor'));
    await expect(invitation.getByText('Editor')).toBeVisible();
    await expect(page.getByText('Share note')).toBeVisible();
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
