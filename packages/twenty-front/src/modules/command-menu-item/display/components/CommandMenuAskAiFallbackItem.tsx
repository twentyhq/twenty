import { useLingui } from '@lingui/react/macro';
import { IconMessageCirclePlus } from 'twenty-ui/icon';

import { useStageAiChatPreprompt } from '@/ai/hooks/useStageAiChatPreprompt';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID } from '@/command-menu-item/constants/CommandMenuAskAiFallbackItemId';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type CommandMenuAskAiFallbackItemProps = {
  prompt: string;
};

export const CommandMenuAskAiFallbackItem = ({
  prompt,
}: CommandMenuAskAiFallbackItemProps) => {
  const { t } = useLingui();
  const { switchToNewChat } = useSwitchToNewAiChat();
  const { stageAiChatPreprompt } = useStageAiChatPreprompt();
  const setSidePanelSearch = useSetAtomState(sidePanelSearchState);

  const handleClick = () => {
    switchToNewChat();
    stageAiChatPreprompt({
      text: prompt,
      mode: 'SEND',
      draftKey: AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    });
    setSidePanelSearch('');
  };

  return (
    <SelectableListItem
      itemId={COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID}
      onEnter={handleClick}
    >
      <CommandMenuItem
        id={COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID}
        label={t`Ask AI`}
        Icon={IconMessageCirclePlus}
        onClick={handleClick}
      />
    </SelectableListItem>
  );
};
