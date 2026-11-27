import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  ViewFilterOperand,
  ViewPresetFilter,
  ViewType,
} from 'twenty-shared/types';

import { buildAgentChatChannelViewsToCreateForChannels } from 'src/engine/metadata-modules/agent-chat-channel/utils/build-agent-chat-channel-views-to-create-for-channels.util';

const CHANNEL_WITH_OPEN_VIEW_ID = '20202020-0000-4000-8000-00000000000a';
const CHANNEL_WITHOUT_VIEW_ID = '20202020-0000-4000-8000-00000000000b';
const WORKSPACE_CUSTOM_APPLICATION = '20202020-0000-4000-8000-0000000000c1';

const EXPECTED_INBOX_THREAD_VIEW_FIELDS = [
  { fieldName: 'title', isVisible: true },
  { fieldName: 'channelId', isVisible: true },
  { fieldName: 'lastMessageSenderWorkspaceMemberId', isVisible: true },
  { fieldName: 'lastMessageText', isVisible: true },
  { fieldName: 'assignee', isVisible: false },
  { fieldName: 'createdAt', isVisible: false },
] as const;

describe('buildAgentChatChannelViewsToCreateForChannels', () => {
  it('should create only the views a channel does not have yet', () => {
    const { viewsToCreate, viewFiltersToCreate, viewFieldsToCreate } =
      buildAgentChatChannelViewsToCreateForChannels({
        channelIds: [CHANNEL_WITH_OPEN_VIEW_ID, CHANNEL_WITHOUT_VIEW_ID],
        flatViewMaps: {
          byUniversalIdentifier: {
            openView: { presetFilter: ViewPresetFilter.INBOX_CHANNEL_OPEN },
          },
        },
        flatViewFilterMaps: {
          byUniversalIdentifier: {
            openViewFilter: {
              viewUniversalIdentifier: 'openView',
              fieldMetadataUniversalIdentifier:
                STANDARD_OBJECTS.agentChatThread.fields.channelId
                  .universalIdentifier,
              operand: ViewFilterOperand.IS,
              value: JSON.stringify([CHANNEL_WITH_OPEN_VIEW_ID]),
              viewFilterGroupId: null,
            },
          },
        },
        applicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
      });

    expect(
      viewsToCreate.map(({ universalIdentifier, presetFilter }) => ({
        presetFilter,
        channelFilterValue: viewFiltersToCreate.find(
          ({ viewUniversalIdentifier }) =>
            viewUniversalIdentifier === universalIdentifier,
        )?.value,
      })),
    ).toEqual([
      {
        presetFilter: ViewPresetFilter.INBOX_MENTIONS,
        channelFilterValue: JSON.stringify([CHANNEL_WITH_OPEN_VIEW_ID]),
      },
      {
        presetFilter: ViewPresetFilter.INBOX_CHANNEL_SNOOZED,
        channelFilterValue: JSON.stringify([CHANNEL_WITH_OPEN_VIEW_ID]),
      },
      {
        presetFilter: ViewPresetFilter.INBOX_CHANNEL_DONE,
        channelFilterValue: JSON.stringify([CHANNEL_WITH_OPEN_VIEW_ID]),
      },
      {
        presetFilter: ViewPresetFilter.INBOX_CHANNEL_OPEN,
        channelFilterValue: JSON.stringify([CHANNEL_WITHOUT_VIEW_ID]),
      },
      {
        presetFilter: ViewPresetFilter.INBOX_MENTIONS,
        channelFilterValue: JSON.stringify([CHANNEL_WITHOUT_VIEW_ID]),
      },
      {
        presetFilter: ViewPresetFilter.INBOX_CHANNEL_SNOOZED,
        channelFilterValue: JSON.stringify([CHANNEL_WITHOUT_VIEW_ID]),
      },
      {
        presetFilter: ViewPresetFilter.INBOX_CHANNEL_DONE,
        channelFilterValue: JSON.stringify([CHANNEL_WITHOUT_VIEW_ID]),
      },
    ]);

    const [mentionsView] = viewsToCreate;

    expect(mentionsView).toMatchObject({
      type: ViewType.LIST,
      isCompact: false,
      listPinnedFieldMetadataUniversalIdentifier:
        STANDARD_OBJECTS.agentChatThread.fields.lastActivityAt
          .universalIdentifier,
    });
    expect(
      viewFieldsToCreate
        .filter(
          ({ viewUniversalIdentifier }) =>
            viewUniversalIdentifier === mentionsView.universalIdentifier,
        )
        .map(({ fieldMetadataUniversalIdentifier, position, isVisible }) => ({
          fieldMetadataUniversalIdentifier,
          position,
          isVisible,
        })),
    ).toEqual(
      EXPECTED_INBOX_THREAD_VIEW_FIELDS.map(
        ({ fieldName, isVisible }, position) => ({
          fieldMetadataUniversalIdentifier:
            STANDARD_OBJECTS.agentChatThread.fields[fieldName]
              .universalIdentifier,
          position,
          isVisible,
        }),
      ),
    );
    expect(viewFieldsToCreate).toHaveLength(viewsToCreate.length * 6);
  });
});
