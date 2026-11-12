import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  AGENT_CHAT_THREAD_PRESET_FILTER,
  type AgentChatThreadPresetFilter,
} from 'twenty-shared/ai';

import { AGENT_CHAT_THREAD_PRESET_FILTER_ICONS } from '@/ai/constants/AgentChatThreadPresetFilterIcons';
import { AGENT_CHAT_THREAD_PRESET_FILTER_LABELS } from '@/ai/constants/AgentChatThreadPresetFilterLabels';
import { AI_CHAT_INBOX_INSTANCE_ID } from '@/ai/constants/AiChatInboxInstanceId';
import { agentChatSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { isAgentChatOpenThreadPresetFilter } from '@/ai/utils/isAgentChatOpenThreadPresetFilter';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

type NavigationDrawerAiChatTriageItemProps = {
  presetFilter: AgentChatThreadPresetFilter;
  count?: number;
  isUnread?: boolean;
};

export const NavigationDrawerAiChatTriageItem = ({
  presetFilter,
  count,
  isUnread,
}: NavigationDrawerAiChatTriageItemProps) => {
  const { t } = useLingui();
  const location = useLocation();
  const navigate = useNavigateApp();
  const [
    agentChatSelectedThreadListSource,
    setAgentChatSelectedThreadListSource,
  ] = useAtomState(agentChatSelectedThreadListSourceState);
  const { resetRecordSelection } = useResetRecordSelection(
    AI_CHAT_INBOX_INSTANCE_ID,
  );
  const isCurrentFilter =
    agentChatSelectedThreadListSource.type === 'presetFilter' &&
    (agentChatSelectedThreadListSource.presetFilter === presetFilter ||
      (presetFilter === AGENT_CHAT_THREAD_PRESET_FILTER.OPEN &&
        isAgentChatOpenThreadPresetFilter(
          agentChatSelectedThreadListSource.presetFilter,
        )));

  const handleClick = () => {
    resetRecordSelection();
    setAgentChatSelectedThreadListSource({
      type: 'presetFilter',
      presetFilter,
    });
    navigate(AppPath.AiChatInbox, { threadId: null });
  };

  return (
    <NavigationDrawerItem
      label={t(AGENT_CHAT_THREAD_PRESET_FILTER_LABELS[presetFilter])}
      secondaryLabel={isDefined(count) && count > 0 ? `${count}` : undefined}
      isUnread={isUnread}
      Icon={AGENT_CHAT_THREAD_PRESET_FILTER_ICONS[presetFilter]}
      active={isAiChatInboxPath(location.pathname) && isCurrentFilter}
      onClick={handleClick}
      triggerEvent="CLICK"
    />
  );
};
