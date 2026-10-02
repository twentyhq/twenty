import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendar, IconClock } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { useFormatAgentChatThreadDate } from '@/ai/hooks/useFormatAgentChatThreadDate';
import {
  type AgentChatThreadSnoozeOption,
  getAgentChatThreadSnoozeOptions,
} from '@/ai/utils/getAgentChatThreadSnoozeOptions';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { snoozeAiChatThreadIdComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatThreadIdComponentState';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const SNOOZE_UNTIL_DATE_ITEM_ID = 'snoozeUntilDate';

const StyledSeparatorContainer = styled.div`
  padding: ${themeCssVariables.spacing[1]} 0;
`;

export const SidePanelSnoozeAiChatPage = () => {
  const { t } = useLingui();
  const snoozeAiChatThreadId = useAtomComponentStateValue(
    snoozeAiChatThreadIdComponentState,
  );
  const { snoozeAgentChatThread } = useAgentChatThreadParticipants();
  const { formatAgentChatThreadDateTime } = useFormatAgentChatThreadDate();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openSnoozeAiChatUntilDateInSidePanel } =
    useOpenSnoozeAiChatInSidePanel();
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
    void snoozeAgentChatThread({
      threadId: snoozeAiChatThreadId,
      snoozedUntil: option.date,
    });
  };

  const handleSnoozeUntilDate = () =>
    openSnoozeAiChatUntilDateInSidePanel(snoozeAiChatThreadId);

  return (
    <SidePanelList
      selectableItemIds={[
        ...snoozeOptions.map(({ key }) => key),
        SNOOZE_UNTIL_DATE_ITEM_ID,
      ]}
    >
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
            description={formatAgentChatThreadDateTime(option.date)}
            contextualTextPosition="right"
            onClick={() => handleSnooze(option)}
          />
        </SelectableListItem>
      ))}
      <StyledSeparatorContainer>
        <DropdownMenuSeparator />
      </StyledSeparatorContainer>
      <SelectableListItem
        itemId={SNOOZE_UNTIL_DATE_ITEM_ID}
        onEnter={handleSnoozeUntilDate}
      >
        <CommandMenuItem
          id={SNOOZE_UNTIL_DATE_ITEM_ID}
          Icon={IconCalendar}
          label={t`Day & Time`}
          hasSubMenu
          onClick={handleSnoozeUntilDate}
        />
      </SelectableListItem>
    </SidePanelList>
  );
};
