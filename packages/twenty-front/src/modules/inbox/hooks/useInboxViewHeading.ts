import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_THREAD_PRESET_FILTER_ICONS } from '@/inbox/constants/InboxThreadPresetFilterIcons';
import { INBOX_THREAD_PRESET_FILTER_LABELS } from '@/inbox/constants/InboxThreadPresetFilterLabels';
import { useAiChatChannelIcon } from '@/ai-chat/threads/hooks/useAiChatChannelIcon';
import { aiChatChannelFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatChannelFamilySelector';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { getInboxChannelViewLabel } from '@/inbox/utils/getInboxChannelViewLabel';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useInboxViewHeading = () => {
  const { t } = useLingui();
  const inboxSelectedThreadListSource = useAtomStateValue(
    inboxSelectedThreadListSourceState,
  );
  const inboxSelectedChannelView =
    inboxSelectedThreadListSource.type === 'channel'
      ? inboxSelectedThreadListSource.channelView
      : undefined;
  const aiChatChannel = useAtomFamilySelectorValue(
    aiChatChannelFamilySelector,
    inboxSelectedChannelView?.channelId,
  );
  const ChannelIcon = useAiChatChannelIcon(aiChatChannel?.icon);

  if (inboxSelectedThreadListSource.type === 'presetFilter') {
    return {
      HeadingIcon:
        INBOX_THREAD_PRESET_FILTER_ICONS[
          inboxSelectedThreadListSource.presetFilter
        ],
      headingLabel: t(
        INBOX_THREAD_PRESET_FILTER_LABELS[
          inboxSelectedThreadListSource.presetFilter
        ],
      ),
      channelViewLabel: undefined,
    };
  }

  const channelViewLabel = getInboxChannelViewLabel(
    inboxSelectedThreadListSource.channelView,
  );

  if (!isDefined(aiChatChannel)) {
    return {
      HeadingIcon: ChannelIcon,
      headingLabel: channelViewLabel,
      channelViewLabel: undefined,
    };
  }

  return {
    HeadingIcon: ChannelIcon,
    headingLabel: aiChatChannel.name,
    channelViewLabel,
  };
};
