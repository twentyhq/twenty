import { useLingui } from '@lingui/react/macro';
import { IconMessageCirclePlus } from 'twenty-ui/icon';

import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { useApplyAiChatPreprompt } from '@/ai-chat/composer/hooks/useApplyAiChatPreprompt';
import { useSwitchToNewAiChatInInboxChannel } from '@/inbox/hooks/useSwitchToNewAiChatInInboxChannel';
import { COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID } from '@/command-menu-item/constants/CommandMenuAskAiFallbackItemId';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type CommandMenuAskAiFallbackItemProps = {
  prompt: string;
  isDefaultSelection: boolean;
};

export const CommandMenuAskAiFallbackItem = ({
  prompt,
  isDefaultSelection,
}: CommandMenuAskAiFallbackItemProps) => {
  const { t } = useLingui();
  const { switchToNewAiChat } = useSwitchToNewAiChatInInboxChannel();
  const { applyAiChatPreprompt } = useApplyAiChatPreprompt();
  const setSidePanelSearch = useSetAtomState(sidePanelSearchState);

  const handleClick = async () => {
    setSidePanelSearch('');
    await applyAiChatPreprompt({
      threadId: switchToNewAiChat(),
      serializedDocument:
        serializePlainTextAsAdvancedTextEditorDocument(prompt),
      mode: 'SEND',
    });
  };

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: handleClick,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleClick],
  });

  return (
    <SelectableListItem
      itemId={COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID}
      onEnter={handleClick}
    >
      <CommandMenuItem
        id={COMMAND_MENU_ASK_AI_FALLBACK_ITEM_ID}
        label={t`Ask AI`}
        description={t`“${prompt}”`}
        Icon={IconMessageCirclePlus}
        shortcut={isDefaultSelection ? ['Enter'] : ['Mod', 'Enter']}
        onClick={handleClick}
      />
    </SelectableListItem>
  );
};
