import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAdvancedTextEditor } from '@/advanced-text-editor/hooks/useAdvancedTextEditor';
import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { serializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorDocument';
import { AI_CHAT_EDITOR_PROFILE } from '@/ai/constants/AiChatEditorProfile';
import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { AI_CHAT_INPUT_ID } from '@/ai/constants/AiChatInputId';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { dispatchAgentChatEnsureThreadForDraftEvent } from '@/ai/utils/dispatchAgentChatEnsureThreadForDraftEvent';
import { dispatchAgentChatSendMessageEvent } from '@/ai/utils/dispatchAgentChatSendMessageEvent';
import { MENTION_SUGGESTION_PLUGIN_KEY } from '@/mention/constants/MentionSuggestionPluginKey';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

export const useAiChatEditor = () => {
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const [agentChatDraftsByThreadId, setAgentChatDraftsByThreadId] =
    useAtomState(agentChatDraftsByThreadIdState);
  const { searchMentionRecords } = useMentionSearch();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const draftKey = currentAiChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
  const initialDraft = agentChatDraftsByThreadId[draftKey] ?? '';
  const editor = useAdvancedTextEditor({
    profile: AI_CHAT_EDITOR_PROFILE,
    placeholder: t`Ask, search or make anything...`,
    readonly: false,
    defaultValue: initialDraft,
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
    onUpdate: (currentEditor) => {
      const text = turnIntoEmptyStringIfWhitespacesOnly(
        currentEditor.getText({ blockSeparator: '\n' }),
      );
      const serializedDraft =
        text === '' ? '' : serializeAdvancedTextEditorDocument(currentEditor);

      setAgentChatInput(text);
      setAgentChatDraftsByThreadId((prev) => ({
        ...prev,
        [draftKey]: serializedDraft,
      }));
      if (draftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY && text.trim() !== '') {
        dispatchAgentChatEnsureThreadForDraftEvent();
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

  const handleRestoreEditorContent = useCallback(
    (detail?: { content: string }) => {
      if (isDefined(detail?.content)) {
        editor?.commands.setContent(
          deserializeAdvancedTextEditorDocument({
            serializedDocument: detail.content,
            parseLegacyDocument: AI_CHAT_EDITOR_PROFILE.parseLegacyDocument,
          }),
        );
      }
    },
    [editor],
  );

  useListenToBrowserEvent<{ content: string }>({
    eventName: AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
    onBrowserEvent: handleRestoreEditorContent,
  });

  const handleSendAndClear = () => {
    dispatchAgentChatSendMessageEvent();
    editor?.commands.clearContent();
  };

  return { editor, handleSendAndClear };
};
