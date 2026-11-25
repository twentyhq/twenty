import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewFilterOperand, ViewPresetFilter } from 'twenty-shared/types';

import { buildAgentChatChannelViewsToCreateForChannels } from 'src/engine/metadata-modules/agent-chat-channel/utils/build-agent-chat-channel-views-to-create-for-channels.util';

const CHANNEL_WITH_OPEN_VIEW_ID = '20202020-0000-4000-8000-00000000000a';
const CHANNEL_WITHOUT_VIEW_ID = '20202020-0000-4000-8000-00000000000b';

describe('buildAgentChatChannelViewsToCreateForChannels', () => {
  it('should create only the views a channel does not have yet', () => {
    const { viewsToCreate, viewFiltersToCreate } =
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
        applicationUniversalIdentifier: 'workspace-custom-application',
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
  });
});
