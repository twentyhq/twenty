import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { useEffect } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { PageLayoutRecordPageRenderer } from '@/object-record/record-show/components/PageLayoutRecordPageRenderer';
import { RecordShowResourceLoader } from '@/object-record/record-show/components/RecordShowResourceLoader';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { FileUploadDecorator } from '~/testing/decorators/FileUploadDecorator';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const THREAD_ID = '20202020-0000-4000-8000-00000000thr1';
const MESSAGE_ID = '20202020-0000-4000-8000-00000000msg1';
const PARTICIPANT_ID = '20202020-0000-4000-8000-00000000par1';
const ASSOCIATION_ID = '20202020-0000-4000-8000-00000000ass1';
const MESSAGE_CHANNEL_ID = '20202020-0000-4000-8000-00000000cha1';
const CONNECTED_ACCOUNT_ID = '20202020-0000-4000-8000-00000000acc1';

const PAGE_LAYOUT_ID = 'email-thread-record-layout';
const PAGE_LAYOUT_TAB_ID = 'email-thread-record-tab';

const messageThreadObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('messageThread');

const buildConnection = (typename: string, records: object[]) => ({
  __typename: `${typename}Connection`,
  edges: records.map((node) => ({ __typename: `${typename}Edge`, node })),
  pageInfo: {
    __typename: 'PageInfo',
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  },
  totalCount: records.length,
});

const senderParticipant = {
  __typename: 'MessageParticipant',
  id: PARTICIPANT_ID,
  role: 'from',
  displayName: 'Hanns Moongazer',
  handle: 'hanns@example.com',
  messageId: MESSAGE_ID,
  person: null,
  workspaceMember: null,
};

const threadMessage = {
  __typename: 'Message',
  id: MESSAGE_ID,
  createdAt: '2026-08-01T10:00:00.000Z',
  headerMessageId: '<original@example.com>',
  subject: 'Quarterly report',
  text: 'Here is the report you asked for.',
  receivedAt: '2026-08-01T10:00:00.000Z',
  isDraft: false,
  messageThreadId: THREAD_ID,
  messageThread: { __typename: 'MessageThread', id: THREAD_ID },
  messageParticipants: buildConnection('MessageParticipant', [
    senderParticipant,
  ]),
};

const emailThreadPageLayout = {
  __typename: 'PageLayout' as const,
  id: PAGE_LAYOUT_ID,
  name: 'Message Thread',
  type: PageLayoutType.RECORD_PAGE,
  isFirstTabPinned: true,
  objectMetadataId: messageThreadObjectMetadataItem.id,
  isSystemSideEffect: false,
  applicationId: '',
  universalIdentifier: 'email-thread-record-layout',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
};

const emailThreadPageLayoutTab = {
  __typename: 'PageLayoutTab' as const,
  id: PAGE_LAYOUT_TAB_ID,
  pageLayoutId: PAGE_LAYOUT_ID,
  title: 'Thread',
  position: 0,
  isActive: true,
  isSystemSideEffect: false,
  layoutMode: PageLayoutTabLayoutMode.GRID,
  applicationId: '',
  universalIdentifier: 'email-thread-record-tab',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
};

const emailThreadPageLayoutWidget = {
  __typename: 'PageLayoutWidget' as const,
  id: 'email-thread-widget',
  pageLayoutTabId: PAGE_LAYOUT_TAB_ID,
  type: WidgetType.EMAIL_THREAD,
  title: 'Thread',
  objectMetadataId: messageThreadObjectMetadataItem.id,
  isActive: true,
  isSystemSideEffect: false,
  applicationId: '',
  universalIdentifier: 'email-thread-widget',
  gridPosition: {
    __typename: 'GridPosition' as const,
    row: 0,
    column: 0,
    rowSpan: 12,
    columnSpan: 12,
  },
  configuration: {
    __typename: 'FieldsConfiguration' as const,
    configurationType: WidgetConfigurationType.FIELDS,
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
};

// The mocked minimal metadata ships no page layouts, so the record page has no
// layout to render until this seeds one holding the email thread widget.
const SeedEmailThreadPageLayoutEffect = () => {
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const isMinimalMetadataReady = useAtomStateValue(isMinimalMetadataReadyState);

  useEffect(() => {
    if (!isMinimalMetadataReady) {
      return;
    }

    replaceDraft('pageLayouts', [emailThreadPageLayout], 'mocked');
    replaceDraft('pageLayoutTabs', [emailThreadPageLayoutTab], 'mocked');
    replaceDraft('pageLayoutWidgets', [emailThreadPageLayoutWidget], 'mocked');
    applyChanges();
  }, [isMinimalMetadataReady, replaceDraft, applyChanges]);

  return null;
};

type EmailThreadStoryArgs = PageDecoratorArgs & {
  targetRecordIdentifier: TargetRecordIdentifier;
};

const meta: Meta<EmailThreadStoryArgs> = {
  title:
    'Modules/ObjectRecord/RecordShow/PageLayoutRecordPageRendererEmailThread',
  component: PageLayoutRecordPageRenderer,
  decorators: [
    (Story) => (
      <WorkspaceSurfaceContext.Provider
        value={{
          type: 'side-panel',
          instanceId: 'story-side-panel',
          ownsRouteLocation: true,
        }}
      >
        <CommandMenuComponentInstanceContext.Provider
          value={{ instanceId: 'story-command-menu' }}
        >
          <SeedEmailThreadPageLayoutEffect />
          <RecordShowResourceLoader
            objectNameSingular={CoreObjectNameSingular.MessageThread}
            recordId={THREAD_ID}
          />
          <Story />
        </CommandMenuComponentInstanceContext.Provider>
      </WorkspaceSurfaceContext.Provider>
    ),
    FileUploadDecorator,
    ContextStoreDecorator,
    PageDecorator,
  ],
  args: {
    routePath: '/object/:objectNameSingular/:objectRecordId',
    routeParams: {
      ':objectNameSingular': 'messageThread',
      ':objectRecordId': THREAD_ID,
    },
    targetRecordIdentifier: {
      id: THREAD_ID,
      targetObjectNameSingular: CoreObjectNameSingular.MessageThread,
    },
  },
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        graphql.query('FindOneMessageThread', () =>
          HttpResponse.json({
            data: {
              messageThread: { __typename: 'MessageThread', id: THREAD_ID },
            },
          }),
        ),
        graphql.query('FindManyMessages', () =>
          HttpResponse.json({
            data: {
              messages: buildConnection('Message', [threadMessage]),
            },
          }),
        ),
        graphql.query('FindManyMessageParticipants', () =>
          HttpResponse.json({
            data: {
              messageParticipants: buildConnection('MessageParticipant', [
                senderParticipant,
              ]),
            },
          }),
        ),
        graphql.query('FindManyMessageChannelMessageAssociations', () =>
          HttpResponse.json({
            data: {
              messageChannelMessageAssociations: buildConnection(
                'MessageChannelMessageAssociation',
                [
                  {
                    __typename: 'MessageChannelMessageAssociation',
                    id: ASSOCIATION_ID,
                    messageId: MESSAGE_ID,
                    messageChannelId: MESSAGE_CHANNEL_ID,
                    messageThreadExternalId: 'thread-external-id',
                    messageExternalId: 'message-external-id',
                  },
                ],
              ),
            },
          }),
        ),
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({
            data: {
              myConnectedAccounts: [
                {
                  __typename: 'ConnectedAccount',
                  id: CONNECTED_ACCOUNT_ID,
                  handle: 'me@example.com',
                  provider: 'google',
                },
              ],
            },
          }),
        ),
        graphql.query('MyMessageChannels', () =>
          HttpResponse.json({
            data: {
              myMessageChannels: [
                {
                  __typename: 'MessageChannel',
                  id: MESSAGE_CHANNEL_ID,
                  connectedAccountId: CONNECTED_ACCOUNT_ID,
                },
              ],
            },
          }),
        ),
        graphqlMocks.handlers,
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ReplyOpensComposerInSidePanel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const replyButton = await canvas.findByRole(
      'button',
      { name: /reply/i },
      { timeout: 20000 },
    );

    await userEvent.click(replyButton);

    // The render loop this guards against killed the widget subtree, so the
    // composer never survived past its first frame.
    await expect(
      await canvas.findByRole('button', { name: /send/i }, { timeout: 20000 }),
    ).toBeVisible();

    expect(canvas.queryByText(/invalid configuration/i)).toBeNull();
  },
};
