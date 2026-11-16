import { useLingui } from '@lingui/react/macro';

import { InboxFilterDropdown } from '@/inbox/components/InboxFilterDropdown';
import { INBOX_CHANNEL_OPEN_VIEW_ITEMS } from '@/inbox/constants/InboxChannelOpenViewItems';
import { INBOX_THREAD_PRESET_FILTER_ICONS } from '@/inbox/constants/InboxThreadPresetFilterIcons';
import { INBOX_THREAD_PRESET_FILTER_LABELS } from '@/inbox/constants/InboxThreadPresetFilterLabels';
import { useOpenInboxChannel } from '@/inbox/hooks/useOpenInboxChannel';
import { inboxChannelSummariesState } from '@/inbox/states/inboxChannelSummariesState';
import { type InboxChannelView } from '@/inbox/types/InboxChannelView';
import { findInboxChannelOpenViewItem } from '@/inbox/utils/findInboxChannelOpenViewItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

type InboxChannelViewDropdownProps = {
  channelView: InboxChannelView;
};

export const InboxChannelViewDropdown = ({
  channelView,
}: InboxChannelViewDropdownProps) => {
  const { t } = useLingui();
  const { openInboxChannel } = useOpenInboxChannel();
  const channelSummary = useAtomStateValue(inboxChannelSummariesState)[
    channelView.channelId
  ];
  const selectedOpenViewItem = findInboxChannelOpenViewItem(channelView);

  const handleSelect = ({
    assignment,
    filter,
  }: Pick<InboxChannelView, 'assignment' | 'filter'>) => {
    openInboxChannel({
      channelId: channelView.channelId,
      channelStatus: AgentChatChannelThreadStatus.OPEN,
      assignment,
      filter,
    });
  };

  return (
    <InboxFilterDropdown
      isFiltered={
        channelView.assignment !== AgentChatChannelAssignmentFilter.ANY ||
        channelView.filter !== AgentChatChannelThreadFilter.ANY
      }
      options={INBOX_CHANNEL_OPEN_VIEW_ITEMS.map((openViewItem) => ({
        key: openViewItem.presetFilter,
        label: t(INBOX_THREAD_PRESET_FILTER_LABELS[openViewItem.presetFilter]),
        Icon: INBOX_THREAD_PRESET_FILTER_ICONS[openViewItem.presetFilter],
        count: channelSummary?.[openViewItem.countKey],
        isSelected: openViewItem === selectedOpenViewItem,
        onSelect: () => handleSelect(openViewItem),
      }))}
    />
  );
};
