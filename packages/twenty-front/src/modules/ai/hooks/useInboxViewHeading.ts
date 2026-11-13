import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_THREAD_PRESET_FILTER_ICONS } from '@/ai/constants/InboxThreadPresetFilterIcons';
import { INBOX_THREAD_PRESET_FILTER_LABELS } from '@/ai/constants/InboxThreadPresetFilterLabels';
import { useInboxChannelIcon } from '@/ai/hooks/useInboxChannelIcon';
import { inboxChannelsState } from '@/ai/states/inboxChannelsState';
import { inboxSelectedThreadListSourceState } from '@/ai/states/inboxSelectedThreadListSourceState';
import { getInboxChannelViewLabel } from '@/ai/utils/getInboxChannelViewLabel';
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
  const channel = useAtomStateValue(inboxChannelsState)?.find(
    ({ id }) => id === inboxSelectedChannelView?.channelId,
  );
  const ChannelIcon = useInboxChannelIcon(channel?.icon);

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

  if (!isDefined(channel)) {
    return {
      HeadingIcon: ChannelIcon,
      headingLabel: channelViewLabel,
      channelViewLabel: undefined,
    };
  }

  return {
    HeadingIcon: ChannelIcon,
    headingLabel: channel.name,
    channelViewLabel,
  };
};
