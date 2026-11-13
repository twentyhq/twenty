import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  AGENT_CHAT_THREAD_PRESET_FILTER,
  type AgentChatThreadPresetFilter,
} from 'twenty-shared/ai';

import { INBOX_THREAD_PRESET_FILTER_ICONS } from '@/ai/constants/InboxThreadPresetFilterIcons';
import { INBOX_THREAD_PRESET_FILTER_LABELS } from '@/ai/constants/InboxThreadPresetFilterLabels';
import { INBOX_INSTANCE_ID } from '@/ai/constants/InboxInstanceId';
import { inboxSelectedThreadListSourceState } from '@/ai/states/inboxSelectedThreadListSourceState';
import { isInboxOpenThreadPresetFilter } from '@/ai/utils/isInboxOpenThreadPresetFilter';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isInboxPath } from '~/utils/isInboxPath';

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
  const navigate = useNavigateApp();
  const [inboxSelectedThreadListSource, setInboxSelectedThreadListSource] =
    useAtomState(inboxSelectedThreadListSourceState);
  const { resetRecordSelection } = useResetRecordSelection(INBOX_INSTANCE_ID);
  const isCurrentFilter =
    inboxSelectedThreadListSource.type === 'presetFilter' &&
    (inboxSelectedThreadListSource.presetFilter === presetFilter ||
      (presetFilter === AGENT_CHAT_THREAD_PRESET_FILTER.OPEN &&
        isInboxOpenThreadPresetFilter(
          inboxSelectedThreadListSource.presetFilter,
        )));

  const handleClick = () => {
    resetRecordSelection();
    setInboxSelectedThreadListSource({
      type: 'presetFilter',
      presetFilter,
    });
    navigate(AppPath.AiChatInbox, { threadId: null });
  };

  return (
    <NavigationDrawerItem
      label={t(INBOX_THREAD_PRESET_FILTER_LABELS[presetFilter])}
      secondaryLabel={isDefined(count) && count > 0 ? `${count}` : undefined}
      isUnread={isUnread}
      Icon={INBOX_THREAD_PRESET_FILTER_ICONS[presetFilter]}
      active={isInboxPath(location.pathname) && isCurrentFilter}
      onClick={handleClick}
      triggerEvent="CLICK"
    />
  );
};
