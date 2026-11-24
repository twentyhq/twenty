import { type EditorView } from '@tiptap/pm/view';
import { TOUCH_DEVICE_MEDIA_QUERY } from 'twenty-ui/utilities';

import { MENTION_SUGGESTION_PLUGIN_KEY } from '@/mention/constants/MentionSuggestionPluginKey';
import { SKILL_SUGGESTION_PLUGIN_KEY } from '@/skill-suggestion/constants/SkillSuggestionPluginKey';

type HandleAiChatEditorKeyDownParams = {
  view: EditorView;
  event: KeyboardEvent;
  onSend: (composerContent: { element: HTMLElement; text: string }) => void;
};

export const handleAiChatEditorKeyDown = ({
  view,
  event,
  onSend,
}: HandleAiChatEditorKeyDownParams): boolean => {
  if (event.key !== 'Enter' || event.shiftKey) {
    return false;
  }

  const isSuggestionMenuOpen = [
    MENTION_SUGGESTION_PLUGIN_KEY,
    SKILL_SUGGESTION_PLUGIN_KEY,
  ].some((pluginKey) => pluginKey.getState(view.state)?.active === true);

  if (isSuggestionMenuOpen) {
    return false;
  }

  // Touch keyboards have no Shift+Enter, so return inserts the same line break and the send button sends
  if (window.matchMedia(TOUCH_DEVICE_MEDIA_QUERY).matches) {
    const { state } = view;

    view.dispatch(
      state.tr
        .replaceSelectionWith(state.schema.nodes.hardBreak.create())
        .scrollIntoView(),
    );
    return true;
  }

  event.preventDefault();
  onSend({
    element: view.dom,
    text: view.state.doc.textContent,
  });
  return true;
};
