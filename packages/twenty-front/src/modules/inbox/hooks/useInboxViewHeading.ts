import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_THREAD_PRESET_FILTER_ICONS } from '@/inbox/constants/InboxThreadPresetFilterIcons';
import { INBOX_THREAD_PRESET_FILTER_LABELS } from '@/inbox/constants/InboxThreadPresetFilterLabels';
import { useInboxChannelIcon } from '@/inbox/hooks/useInboxChannelIcon';
import { inboxChannelsState } from '@/inbox/states/inboxChannelsState';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { getInboxChannelViewLabel } from '@/inbox/utils/getInboxChannelViewLabel';
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
