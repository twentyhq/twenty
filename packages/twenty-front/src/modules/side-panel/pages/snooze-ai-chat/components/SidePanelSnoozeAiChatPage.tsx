import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
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
  const [optionsComputedAt, setOptionsComputedAt] = useState(() => new Date());

  if (!isDefined(snoozeAiChatThreadId)) {
    return null;
  }

  const snoozeOptions = getAgentChatThreadSnoozeOptions(optionsComputedAt);

  // An option can pass while the page stays open, so the list is refreshed
  // instead of snoozing into the past
  const handleSnooze = (option: AgentChatThreadSnoozeOption) => {
    const now = new Date();

    if (option.date <= now) {
      setOptionsComputedAt(now);
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
          onEnter={() => handleSnooze(option)}
        >
          <CommandMenuItem
            id={option.key}
            Icon={IconClock}
            label={t(option.label)}
            description={SNOOZE_TIME_FORMAT.format(option.date)}
            onClick={() => handleSnooze(option)}
          />
        </SelectableListItem>
      ))}
    </SidePanelList>
  );
};
