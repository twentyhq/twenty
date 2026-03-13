import { t } from '@lingui/core/macro';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Placeholder } from '@tiptap/extensions/placeholder';
import { useEditor } from '@tiptap/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAgentChatContext } from '@/ai/contexts/AgentChatContext';
import { AI_CHAT_INPUT_ID } from '@/ai/constants/AiChatInputId';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { dispatchAgentChatSendMessageEvent } from '@/ai/utils/dispatchAgentChatSendMessageEvent';
import { MENTION_SUGGESTION_PLUGIN_KEY } from '@/mention/constants/MentionSuggestionPluginKey';
import { MentionSuggestion } from '@/mention/extensions/MentionSuggestion';
import { MentionTag } from '@/mention/extensions/MentionTag';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

const textToTiptapContent = (text: string) => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: text ? [{ type: 'text', text }] : [],
    },
  ],
});

export const useAIChatEditor = () => {
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);
  const [agentChatDraftsByThreadId, setAgentChatDraftsByThreadId] =
    useAtomState(agentChatDraftsByThreadIdState);
  const { ensureThreadForDraft } = useAgentChatContext();

  const { searchMentionRecords } = useMentionSearch();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const draftKey = currentAIChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
  const initialDraft = agentChatDraftsByThreadId[draftKey] ?? '';
  const initialContent = textToTiptapContent(initialDraft);

  const extensions = useMemo(
    () => [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: t`Ask, search or make anything...`,
      }),
      HardBreak.configure({
        keepMarks: false,
      }),
      MentionTag,
      MentionSuggestion,
    ],
    [],
  );

  const editor = useEditor({
    content: initialContent,
    extensions,
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          const suggestionState = MENTION_SUGGESTION_PLUGIN_KEY.getState(
            view.state,
          );
          if (suggestionState?.active === true) {
            return false;
          }

          event.preventDefault();
          dispatchAgentChatSendMessageEvent();

          const { state } = view;
          view.dispatch(state.tr.delete(0, state.doc.content.size));
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const text = turnIntoEmptyStringIfWhitespacesOnly(
        currentEditor.getText({ blockSeparator: '\n' }),
      );
      setAgentChatInput(text);
      setAgentChatDraftsByThreadId((prev) => ({ ...prev, [draftKey]: text }));
      if (draftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY && text.trim() !== '') {
        ensureThreadForDraft?.();
      }
    },
    onFocus: () => {
      pushFocusItemToFocusStack({
        focusId: AI_CHAT_INPUT_ID,
        component: {
          type: FocusComponentType.TEXT_AREA,
          instanceId: AI_CHAT_INPUT_ID,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
    },
    onBlur: () => {
      removeFocusItemFromFocusStackById({ focusId: AI_CHAT_INPUT_ID });
    },
    injectCSS: false,
  });

  // Keep search function in sync via Tiptap extension storage,
  // avoiding stale closures without useRef
  if (isDefined(editor)) {
    const storage = editor.extensionStorage as unknown as Record<
      string,
      unknown
    >;
    const mentionStorage = storage['mention-suggestion'] as {
      searchMentionRecords: typeof searchMentionRecords;
    };
    mentionStorage.searchMentionRecords = searchMentionRecords;
  }

  const handleSendAndClear = () => {
    dispatchAgentChatSendMessageEvent();
    editor?.commands.clearContent();
  };

  return { editor, handleSendAndClear };
};
