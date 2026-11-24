import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewFilterOperand, ViewPresetFilter } from 'twenty-shared/types';

import { findAgentChatChannelFlatViews } from 'src/engine/metadata-modules/agent-chat-channel/utils/find-agent-chat-channel-flat-views.util';

const CHANNEL_ID = '20202020-0000-4000-8000-00000000000a';
const OTHER_CHANNEL_ID = '20202020-0000-4000-8000-00000000000b';

const buildChannelViewFilter = ({
  viewUniversalIdentifier,
  channelIds,
  viewFilterGroupId = null,
}: {
  viewUniversalIdentifier: string;
  channelIds: string[];
  viewFilterGroupId?: string | null;
}) => ({
  viewUniversalIdentifier,
  fieldMetadataUniversalIdentifier:
    STANDARD_OBJECTS.agentChatThread.fields.channelId.universalIdentifier,
  operand: ViewFilterOperand.IS,
  value: JSON.stringify(channelIds),
  viewFilterGroupId,
});

describe('findAgentChatChannelFlatViews', () => {
  it('should only find the views that carry a channel preset and a top-level filter on that single channel', () => {
    const channelViews = findAgentChatChannelFlatViews({
      channelId: CHANNEL_ID,
      flatViewMaps: {
        byUniversalIdentifier: {
          channelOpenView: {
            name: 'Channel open view',
            presetFilter: ViewPresetFilter.INBOX_CHANNEL_OPEN,
          },
          personalViewFilteredOnTheChannel: {
            name: 'Personal view filtered on the channel',
            presetFilter: ViewPresetFilter.INBOX_OPEN,
          },
          viewWithoutPresetFilteredOnTheChannel: {
            name: 'View without preset filtered on the channel',
            presetFilter: null,
          },
          channelViewFilteredInsideAGroup: {
            name: 'Channel view filtered inside a group',
            presetFilter: ViewPresetFilter.INBOX_CHANNEL_DONE,
          },
          channelViewFilteredOnTwoChannels: {
            name: 'Channel view filtered on two channels',
            presetFilter: ViewPresetFilter.INBOX_CHANNEL_SNOOZED,
          },
          otherChannelOpenView: {
            name: 'Other channel open view',
            presetFilter: ViewPresetFilter.INBOX_CHANNEL_OPEN,
          },
        },
      },
      flatViewFilterMaps: {
        byUniversalIdentifier: {
          channelOpenViewFilter: buildChannelViewFilter({
            viewUniversalIdentifier: 'channelOpenView',
            channelIds: [CHANNEL_ID],
          }),
          personalViewFilter: buildChannelViewFilter({
            viewUniversalIdentifier: 'personalViewFilteredOnTheChannel',
            channelIds: [CHANNEL_ID],
          }),
          viewWithoutPresetFilter: buildChannelViewFilter({
            viewUniversalIdentifier: 'viewWithoutPresetFilteredOnTheChannel',
            channelIds: [CHANNEL_ID],
          }),
          groupedFilter: buildChannelViewFilter({
            viewUniversalIdentifier: 'channelViewFilteredInsideAGroup',
            channelIds: [CHANNEL_ID],
            viewFilterGroupId: 'view-filter-group',
          }),
          twoChannelsFilter: buildChannelViewFilter({
            viewUniversalIdentifier: 'channelViewFilteredOnTwoChannels',
            channelIds: [CHANNEL_ID, OTHER_CHANNEL_ID],
          }),
          otherChannelFilter: buildChannelViewFilter({
            viewUniversalIdentifier: 'otherChannelOpenView',
            channelIds: [OTHER_CHANNEL_ID],
          }),
        },
      },
    });

    expect(channelViews).toEqual([
      {
        name: 'Channel open view',
        presetFilter: ViewPresetFilter.INBOX_CHANNEL_OPEN,
      },
    ]);
  });
});
