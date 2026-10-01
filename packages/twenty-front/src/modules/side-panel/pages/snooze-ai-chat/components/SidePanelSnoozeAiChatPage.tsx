import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconClock } from 'twenty-ui/icon';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import {
  type AgentChatThreadSnoozeOption,
  getAgentChatThreadSnoozeOptions,
} from '@/ai/utils/getAgentChatThreadSnoozeOptions';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { snoozeAiChatThreadIdComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatThreadIdComponentState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const SNOOZE_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

export const SidePanelSnoozeAiChatPage = () => {
  const { t } = useLingui();
  const snoozeAiChatThreadId = useAtomComponentStateValue(
    snoozeAiChatThreadIdComponentState,
  );
  const { snoozeAgentChatThread } = useAgentChatThreadParticipants();
  const { closeSidePanelMenu } = useSidePanelMenu();

  if (!isDefined(snoozeAiChatThreadId)) {
    return null;
  }

  const snoozeOptions = getAgentChatThreadSnoozeOptions(new Date());

  // The page can stay open past an option's time, so the time is taken again
  // on selection
  const handleSnooze = (optionKey: AgentChatThreadSnoozeOption['key']) => {
    const option = getAgentChatThreadSnoozeOptions(new Date()).find(
      ({ key }) => key === optionKey,
    );

    if (!isDefined(option)) {
      return;
    }

    void closeSidePanelMenu();
    void snoozeAgentChatThread(snoozeAiChatThreadId, option.date);
  };

  return (
    <SidePanelList selectableItemIds={snoozeOptions.map(({ key }) => key)}>
      {snoozeOptions.map((option) => (
        <SelectableListItem
          key={option.key}
          itemId={option.key}
          onEnter={() => handleSnooze(option.key)}
        >
          <CommandMenuItem
            id={option.key}
            Icon={IconClock}
            label={t(option.label)}
            description={SNOOZE_TIME_FORMAT.format(option.date)}
            onClick={() => handleSnooze(option.key)}
          />
        </SelectableListItem>
      ))}
    </SidePanelList>
  );
};
