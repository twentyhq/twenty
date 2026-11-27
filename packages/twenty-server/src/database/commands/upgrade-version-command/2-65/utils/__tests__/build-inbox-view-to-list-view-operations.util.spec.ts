import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewType } from 'twenty-shared/types';

import { buildInboxViewToListViewOperations } from 'src/database/commands/upgrade-version-command/2-65/utils/build-inbox-view-to-list-view-operations.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const WORKSPACE_CUSTOM_APPLICATION = '20202020-0000-4000-8000-0000000000c1';
const NOW = '2026-11-26T00:00:00.000Z';
const INBOX_THREAD = STANDARD_OBJECTS.agentChatThread;
const STANDARD_OPEN_VIEW = INBOX_THREAD.views.open.universalIdentifier;

const LIST_VIEW_PROPERTIES = {
  type: ViewType.LIST,
  isCompact: false,
  listPinnedFieldMetadataUniversalIdentifier:
    INBOX_THREAD.fields.lastActivityAt.universalIdentifier,
  updatedAt: NOW,
};

const buildInboxFlatView = ({
  universalIdentifier,
  applicationUniversalIdentifier,
}: {
  universalIdentifier: string;
  applicationUniversalIdentifier: string;
}) => ({
  universalIdentifier,
  applicationUniversalIdentifier,
  type: ViewType.INBOX,
  isCompact: false,
  listPinnedFieldMetadataUniversalIdentifier: null,
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const INBOX_THREAD_VIEW_FIELD_NAMES = [
  'title',
  'channelId',
  'lastMessageSenderWorkspaceMemberId',
  'lastMessageText',
  'assignee',
  'createdAt',
] as const;

const STANDARD_OPEN_VIEW_FIELDS = [
  {
    viewUniversalIdentifier: STANDARD_OPEN_VIEW,
    fieldMetadataUniversalIdentifier:
      INBOX_THREAD.fields.title.universalIdentifier,
    position: 0,
  },
  {
    viewUniversalIdentifier: STANDARD_OPEN_VIEW,
    fieldMetadataUniversalIdentifier:
      INBOX_THREAD.fields.channelId.universalIdentifier,
    position: 1,
  },
];

describe('buildInboxViewToListViewOperations', () => {
  it('should turn inbox views into list views and give them their view fields, written by their owner', () => {
    const standardInboxView = buildInboxFlatView({
      universalIdentifier: STANDARD_OPEN_VIEW,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
    });
    const channelInboxView = buildInboxFlatView({
      universalIdentifier: 'channel-open-view',
      applicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
    });

    const operations = buildInboxViewToListViewOperations({
      flatViews: [standardInboxView, channelInboxView],
      standardFlatViewFields: STANDARD_OPEN_VIEW_FIELDS,
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION,
      now: NOW,
    });

    expect(
      operations.map(
        ({
          writerApplicationUniversalIdentifier,
          viewsToUpdate,
          viewFieldsToCreate,
        }) => ({
          writerApplicationUniversalIdentifier,
          viewsToUpdate,
          viewFields: viewFieldsToCreate.map(
            ({
              viewUniversalIdentifier,
              fieldMetadataUniversalIdentifier,
              position,
            }) => ({
              viewUniversalIdentifier,
              fieldMetadataUniversalIdentifier,
              position,
            }),
          ),
        }),
      ),
    ).toEqual([
      {
        writerApplicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
        viewsToUpdate: [{ ...standardInboxView, ...LIST_VIEW_PROPERTIES }],
        viewFields: STANDARD_OPEN_VIEW_FIELDS,
      },
      {
        writerApplicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
        viewsToUpdate: [{ ...channelInboxView, ...LIST_VIEW_PROPERTIES }],
        viewFields: INBOX_THREAD_VIEW_FIELD_NAMES.map(
          (fieldName, position) => ({
            viewUniversalIdentifier: 'channel-open-view',
            fieldMetadataUniversalIdentifier:
              INBOX_THREAD.fields[fieldName].universalIdentifier,
            position,
          }),
        ),
      },
    ]);
  });

  it('should do nothing once every inbox view is a list view', () => {
    expect(
      buildInboxViewToListViewOperations({
        flatViews: [
          {
            ...buildInboxFlatView({
              universalIdentifier: STANDARD_OPEN_VIEW,
              applicationUniversalIdentifier:
                TWENTY_STANDARD_APPLICATION.universalIdentifier,
            }),
            ...LIST_VIEW_PROPERTIES,
          },
          {
            ...buildInboxFlatView({
              universalIdentifier: 'channel-open-view',
              applicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
            }),
            ...LIST_VIEW_PROPERTIES,
          },
        ],
        standardFlatViewFields: STANDARD_OPEN_VIEW_FIELDS,
        workspaceCustomApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION,
        now: NOW,
      }),
    ).toEqual([]);
  });
});
