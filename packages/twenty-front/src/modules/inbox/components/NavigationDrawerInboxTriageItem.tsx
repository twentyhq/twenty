import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  AGENT_CHAT_THREAD_PRESET_FILTER,
  type AgentChatThreadPresetFilter,
} from 'twenty-shared/ai';

import { NavigationDrawerInboxCountBadge } from '@/inbox/components/NavigationDrawerInboxCountBadge';
import { INBOX_THREAD_PRESET_FILTER_ICONS } from '@/inbox/constants/InboxThreadPresetFilterIcons';
import { INBOX_THREAD_PRESET_FILTER_LABELS } from '@/inbox/constants/InboxThreadPresetFilterLabels';
import { INBOX_INSTANCE_ID } from '@/inbox/constants/InboxInstanceId';
import { useOpenInboxPresetFilter } from '@/inbox/hooks/useOpenInboxPresetFilter';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { isInboxOpenThreadPresetFilter } from '@/inbox/utils/isInboxOpenThreadPresetFilter';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { isInboxPath } from '~/utils/isInboxPath';
import { NavigationMenuTabFirstItemOpenEffect } from '@/navigation-menu-item/display/effect-components/NavigationMenuTabFirstItemOpenEffect';

type NavigationDrawerInboxTriageItemProps = {
  presetFilter: AgentChatThreadPresetFilter;
  count?: number;
  isUnread?: boolean;
};

export const NavigationDrawerInboxTriageItem = ({
  presetFilter,
  count,
  isUnread,
}: NavigationDrawerInboxTriageItemProps) => {
  const { t } = useLingui();
  const location = useLocation();
  const inboxRecordRouteObjectNames = useAtomStateValue(
    inboxRecordRouteObjectNamesSelector,
  );
  const inboxSelectedThreadListSource = useAtomStateValue(
    inboxSelectedThreadListSourceState,
  );
  const { openInboxPresetFilter } = useOpenInboxPresetFilter(INBOX_INSTANCE_ID);
  const isCurrentFilter =
    inboxSelectedThreadListSource.type === 'presetFilter' &&
    (inboxSelectedThreadListSource.presetFilter === presetFilter ||
      (presetFilter === AGENT_CHAT_THREAD_PRESET_FILTER.OPEN &&
        isInboxOpenThreadPresetFilter(
          inboxSelectedThreadListSource.presetFilter,
        )));
  const hasCount = isDefined(count) && count > 0;

  return (
    <>
      <NavigationMenuTabFirstItemOpenEffect
        onOpen={() => openInboxPresetFilter(presetFilter)}
      />
      <NavigationDrawerItem
        label={t(INBOX_THREAD_PRESET_FILTER_LABELS[presetFilter])}
        isUnread={isUnread}
        Icon={INBOX_THREAD_PRESET_FILTER_ICONS[presetFilter]}
        active={
          isInboxPath(location.pathname, inboxRecordRouteObjectNames) &&
          isCurrentFilter
        }
        onClick={() => openInboxPresetFilter(presetFilter)}
        triggerEvent="CLICK"
        rightOptions={
          hasCount ? (
            <NavigationDrawerInboxCountBadge count={count} />
          ) : undefined
        }
        alwaysShowRightOptions={hasCount}
      />
    </>
  );
};
