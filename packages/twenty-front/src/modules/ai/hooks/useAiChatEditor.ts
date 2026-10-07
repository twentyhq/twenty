import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { useAdvancedTextEditor } from '@/advanced-text-editor/hooks/useAdvancedTextEditor';
import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { serializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorDocument';
import { AI_CHAT_EDITOR_PROFILE } from '@/ai/constants/AiChatEditorProfile';
import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { AI_CHAT_INPUT_ID } from '@/ai/constants/AiChatInputId';
import { useAiChatFileUpload } from '@/ai/hooks/useAiChatFileUpload';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { AGENT_CHAT_ENSURE_THREAD_FOR_DRAFT_EVENT_NAME } from '@/ai/constants/AgentChatEnsureThreadForDraftEventName';
import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { MENTION_SUGGESTION_PLUGIN_KEY } from '@/mention/constants/MentionSuggestionPluginKey';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { useWorkspaceMemberMentionSearch } from '@/mention/hooks/useWorkspaceMemberMentionSearch';
import { SKILL_SUGGESTION_PLUGIN_KEY } from '@/skill-suggestion/constants/SkillSuggestionPluginKey';
import { useSkillSuggestionSearch } from '@/skill-suggestion/hooks/useSkillSuggestionSearch';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

export const useAiChatEditor = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const [agentChatDraftsByThreadId, setAgentChatDraftsByThreadId] =
    useAtomState(agentChatDraftsByThreadIdState);
  const { searchMentionRecords } = useMentionSearch();
  const { searchWorkspaceMembers } = useWorkspaceMemberMentionSearch();
  const { searchSkills } = useSkillSuggestionSearch();
  const { uploadFiles } = useAiChatFileUpload();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const draftKey = currentAiChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
  const initialDraft = agentChatDraftsByThreadId[draftKey] ?? '';
  const editor = useAdvancedTextEditor({
    profile: AI_CHAT_EDITOR_PROFILE,
    placeholder: t`Ask anything, @ a teammate or record, / a skill...`,
    readonly: false,
    defaultValue: initialDraft,
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          const isSuggestionMenuOpen = [
            MENTION_SUGGESTION_PLUGIN_KEY,
            SKILL_SUGGESTION_PLUGIN_KEY,
          ].some(
            (pluginKey) => pluginKey.getState(view.state)?.active === true,
          );
          if (isSuggestionMenuOpen) {
            return false;
          }

          event.preventDefault();
          dispatchBrowserEvent(AGENT_CHAT_SEND_MESSAGE_EVENT_NAME);

          const { state } = view;
          view.dispatch(state.tr.delete(0, state.doc.content.size));
          return true;
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const clipboardData = event.clipboardData;

        if (
          !isDefined(clipboardData) ||
          clipboardData.types.includes('text/plain')
        ) {
          return false;
        }

        const pastedFiles = Array.from(clipboardData.files);

        if (!isNonEmptyArray(pastedFiles)) {
          return false;
        }

        uploadFiles(pastedFiles);
        return true;
      },
    },
    onUpdate: (currentEditor) => {
      const text = turnIntoEmptyStringIfWhitespacesOnly(
        currentEditor.getText({ blockSeparator: '\n' }),
      );
      const serializedDraft =
        text === '' ? '' : serializeAdvancedTextEditorDocument(currentEditor);

      setAgentChatDraftsByThreadId((prev) => ({
        ...prev,
        [draftKey]: serializedDraft,
      }));
      if (draftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY && text.trim() !== '') {
        dispatchBrowserEvent(AGENT_CHAT_ENSURE_THREAD_FOR_DRAFT_EVENT_NAME);
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

  // Extension storage avoids stale closures without a ref.
  if (isDefined(editor)) {
    const storage = editor.extensionStorage as unknown as Record<
      string,
      unknown
    >;
    const mentionStorage = storage['mention-suggestion'] as {
      searchMentionRecords: typeof searchMentionRecords;
      searchWorkspaceMembers: typeof searchWorkspaceMembers;
    };
    mentionStorage.searchMentionRecords = searchMentionRecords;
    mentionStorage.searchWorkspaceMembers = searchWorkspaceMembers;

    const skillStorage = storage['skill-suggestion'] as {
      searchSkills: typeof searchSkills;
    };
    skillStorage.searchSkills = searchSkills;
  }

  const handleRestoreEditorContent = useCallback(
    (detail?: { content: string }) => {
      if (isDefined(detail?.content)) {
        editor?.commands.setContent(
          deserializeAdvancedTextEditorDocument({
            serializedDocument: detail.content,
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
    dispatchBrowserEvent(AGENT_CHAT_SEND_MESSAGE_EVENT_NAME);
    editor?.commands.clearContent();
  };

  return { editor, handleSendAndClear };
};
