import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_THREAD_PRESET_FILTER_LABELS } from '@/inbox/constants/InboxThreadPresetFilterLabels';
import { type InboxChannelView } from '@/inbox/types/InboxChannelView';
import { findInboxChannelOpenViewItem } from '@/inbox/utils/findInboxChannelOpenViewItem';
import { getInboxChannelNavigationItemOrThrow } from '@/inbox/utils/getInboxChannelNavigationItemOrThrow';

export const getInboxChannelViewLabel = (
  channelView: Pick<
    InboxChannelView,
    'channelStatus' | 'assignment' | 'filter'
  >,
) => {
  const openViewItem = findInboxChannelOpenViewItem(channelView);

  if (isDefined(openViewItem)) {
    return t(INBOX_THREAD_PRESET_FILTER_LABELS[openViewItem.presetFilter]);
  }

  return t(getInboxChannelNavigationItemOrThrow(channelView).label);
};
