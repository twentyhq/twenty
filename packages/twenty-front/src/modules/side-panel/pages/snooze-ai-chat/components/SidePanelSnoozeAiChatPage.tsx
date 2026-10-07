import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId, useState } from 'react';
import { IconCalendar, IconClock } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { useFormatAgentChatThreadDate } from '@/ai/hooks/useFormatAgentChatThreadDate';
import {
  type AgentChatThreadSnoozeOption,
  getAgentChatThreadSnoozeOptions,
} from '@/ai/utils/getAgentChatThreadSnoozeOptions';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useSnoozeAiChatThreads } from '@/side-panel/pages/snooze-ai-chat/hooks/useSnoozeAiChatThreads';
import { SnoozeAiChatUntilDatePicker } from '@/side-panel/pages/snooze-ai-chat/components/SnoozeAiChatUntilDatePicker';
import { snoozeAiChatThreadIdsComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatThreadIdsComponentState';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const SNOOZE_UNTIL_DATE_ITEM_ID = 'snoozeUntilDate';

const StyledSeparatorContainer = styled.div`
  padding: ${themeCssVariables.spacing[1]} 0;
`;

export const SidePanelSnoozeAiChatPage = () => {
  const { t } = useLingui();
  const snoozeAiChatThreadIds = useAtomComponentStateValue(
    snoozeAiChatThreadIdsComponentState,
  );
  const { snoozeAiChatThreads } = useSnoozeAiChatThreads();
  const { formatAgentChatThreadDateTime } = useFormatAgentChatThreadDate();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openDropdown } = useOpenDropdown();
  const { userTimezone } = useUserTimezone();
  const [optionsComputedAt, setOptionsComputedAt] = useState(() => new Date());
  const untilDateDropdownId = useId();

  if (snoozeAiChatThreadIds.length === 0) {
    return null;
  }

  const snoozeOptions = getAgentChatThreadSnoozeOptions({
    now: optionsComputedAt,
    timeZone: userTimezone,
  });

  // An option can pass while the page stays open, so the list is refreshed
  // instead of snoozing into the past
  const handleSnooze = (option: AgentChatThreadSnoozeOption) => {
    const now = new Date();

    if (option.date <= now) {
      setOptionsComputedAt(now);
      return;
    }

    void closeSidePanelMenu();
    void snoozeAiChatThreads({
      threadIds: snoozeAiChatThreadIds,
      snoozedUntil: option.date,
    });
  };

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
        onEnter={() =>
          openDropdown({
            dropdownComponentInstanceIdFromProps: untilDateDropdownId,
          })
        }
      >
        <CommandMenuItemDropdown
          id={SNOOZE_UNTIL_DATE_ITEM_ID}
          Icon={IconCalendar}
          label={t`Day & Time`}
          dropdownId={untilDateDropdownId}
          dropdownPlacement="bottom-start"
          dropdownComponents={
            <SnoozeAiChatUntilDatePicker
              threadIds={snoozeAiChatThreadIds}
              onSnoozed={closeSidePanelMenu}
            />
          }
        />
      </SelectableListItem>
    </SidePanelList>
  );
};
