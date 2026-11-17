import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { EmailComposerFields } from '@/activities/emails/components/EmailComposerFields';
import { useEmailComposerState } from '@/activities/emails/hooks/useEmailComposerState';
import { emailComposerDraftFamilyState } from '@/activities/emails/states/emailComposerDraftFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const SHARED_DRAFT_KEY = 'story-shared-email-reply';

const SharedDraftComposer = () => {
  const composerState = useEmailComposerState({
    connectedAccountId: 'account-1',
    defaultTo: 'ada@lovelace.com',
    defaultSubject: 'Re: Hello',
    draftKey: SHARED_DRAFT_KEY,
  });

  return <EmailComposerFields composerState={composerState} />;
};

const TwoComposersSharingADraft = () => (
  <>
    <SharedDraftComposer />
    <SharedDraftComposer />
  </>
);

const meta: Meta<typeof TwoComposersSharingADraft> = {
  title: 'Modules/Activities/Emails/EmailComposerFields',
  component: TwoComposersSharingADraft,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    WorkspaceDecorator,
  ],
  parameters: {
    container: { width: 480 },
    msw: {
      handlers: [
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({ data: { myConnectedAccounts: [] } }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
  beforeEach: () => {
    jotaiStore.set(
      emailComposerDraftFamilyState.atomFamily(SHARED_DRAFT_KEY),
      null,
    );
  },
};

export default meta;
type Story = StoryObj<typeof TwoComposersSharingADraft>;

export const SharedDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const [firstSubject, secondSubject] = await canvas.findAllByRole(
      'textbox',
      { name: 'Subject' },
    );

    await userEvent.type(firstSubject, ' again');
    await expect(secondSubject).toHaveValue('Re: Hello again');

    const [firstBody, secondBody] = Array.from(
      canvasElement.querySelectorAll('.ProseMirror'),
    );

    await userEvent.click(firstBody);
    await userEvent.keyboard('Shared reply');

    await waitFor(() => expect(secondBody).toHaveTextContent('Shared reply'));
  },
};
