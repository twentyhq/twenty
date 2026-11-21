import { type AiChatRestoreEditorContentEventDetail } from '@/ai-chat/composer/types/AiChatRestoreEditorContentEventDetail';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useCallback, useEffect, useLayoutEffect } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { useAdvancedTextEditor } from '@/advanced-text-editor/hooks/useAdvancedTextEditor';
import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { serializeAiChatEditorDraft } from '@/ai-chat/composer/utils/serializeAiChatEditorDraft';
import { AI_CHAT_EDITOR_PROFILE } from '@/ai-chat/composer/constants/AiChatEditorProfile';
import { AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai-chat/composer/constants/AiChatRestoreEditorContentEventName';
import { AI_CHAT_INPUT_ID } from '@/ai-chat/composer/constants/AiChatInputId';
import { useAiChatFileUpload } from '@/ai-chat/composer/hooks/useAiChatFileUpload';
import { useAiChatAssistantProfile } from '@/ai-chat/hooks/useAiChatAssistantProfile';
import { aiChatThreadIsDirectMessageFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
import { aiChatComposerShouldFocusFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldFocusFamilyState';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { MENTION_SUGGESTION_PLUGIN_KEY } from '@/mention/constants/MentionSuggestionPluginKey';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { getAiChatAssistantMentionSearchResults } from '@/ai-chat/composer/utils/getAiChatAssistantMentionSearchResults';
import { useWorkspaceMemberMentionSearch } from '@/mention/hooks/useWorkspaceMemberMentionSearch';
import { SKILL_SUGGESTION_PLUGIN_KEY } from '@/skill-suggestion/constants/SkillSuggestionPluginKey';
import { useSkillSuggestionSearch } from '@/skill-suggestion/hooks/useSkillSuggestionSearch';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

type UseAiChatEditorParams = {
  onSend: (composerContent: { element: HTMLElement; text: string }) => void;
};

export const useAiChatEditor = ({ onSend }: UseAiChatEditorParams) => {
  const { t } = useLingui();
  const { displayName: assistantDisplayName } = useAiChatAssistantProfile();
  const { threadId: draftKey } = useAiChatInstanceOrThrow();
  const aiModels = useAtomStateValue(aiModelsState);
  const [aiChatComposerDrafts, setAiChatComposerDrafts] = useAtomState(
    aiChatComposerDraftsState,
  );
  const { searchMentionRecords } = useMentionSearch();
  const { searchWorkspaceMembers } = useWorkspaceMemberMentionSearch();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { searchSkills } = useSkillSuggestionSearch();
  const { uploadFiles } = useAiChatFileUpload();
  const isDirectMessage = useAtomFamilySelectorValue(
    aiChatThreadIsDirectMessageFamilySelector,
    draftKey,
  );
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const initialDraft = aiChatComposerDrafts[draftKey] ?? '';
  const editor = useAdvancedTextEditor({
    profile: AI_CHAT_EDITOR_PROFILE,
    placeholder: isDirectMessage
      ? t`Write a message...`
      : t`Ask, search or make anything...`,
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
          onSend({
            element: view.dom,
            text: view.state.doc.textContent,
          });
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

        uploadFiles({ files: pastedFiles, threadId: draftKey });
        return true;
      },
    },
    onUpdate: (currentEditor) => {
      const serializedDraft = serializeAiChatEditorDraft(currentEditor);

      setAiChatComposerDrafts((prev) => ({
        ...prev,
        [draftKey]: serializedDraft,
      }));
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
    const storage = editor.extensionStorage;
    const mentionStorage = storage['mention-suggestion'] as {
      searchMentionRecords: typeof searchMentionRecords;
      searchWorkspaceMembers: typeof searchWorkspaceMembers;
    };
    mentionStorage.searchMentionRecords = isDirectMessage
      ? async () => []
      : searchMentionRecords;
    mentionStorage.searchWorkspaceMembers = (query) => {
      if (!isAiChatInboxEnabled) {
        return [];
      }

      const matchingWorkspaceMembers = isDirectMessage
        ? []
        : searchWorkspaceMembers(query);

      if (!isNonEmptyArray(aiModels)) {
        return matchingWorkspaceMembers;
      }

      return [
        ...getAiChatAssistantMentionSearchResults({
          query,
          assistantDisplayName,
          objectLabelSingular: t`Assistant`,
          objectLabelPlural: t`Teammates`,
        }),
        ...matchingWorkspaceMembers,
      ];
    };

    const skillStorage = storage['skill-suggestion'] as {
      searchSkills: typeof searchSkills;
    };
    skillStorage.searchSkills = isDirectMessage ? async () => [] : searchSkills;
  }

  const handleRestoreEditorContent = useCallback(
    (detail?: AiChatRestoreEditorContentEventDetail) => {
      if (detail?.threadId === draftKey && isDefined(detail.content)) {
        editor?.commands.setContent(
          deserializeAdvancedTextEditorDocument({
            serializedDocument: detail.content,
          }),
        );
      }
    },
    [draftKey, editor],
  );

  useListenToBrowserEvent<AiChatRestoreEditorContentEventDetail>({
    eventName: AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
    onBrowserEvent: handleRestoreEditorContent,
  });

  const [aiChatComposerShouldFocus, setAiChatComposerShouldFocus] =
    useAtomFamilyState(aiChatComposerShouldFocusFamilyState, {
      threadId: draftKey,
    });

  useLayoutEffect(() => {
    // A destroyed editor is still defined while its replacement mounts and its commands throw; keeping the request hands focus to the live one.
    if (
      !aiChatComposerShouldFocus ||
      !isDefined(editor) ||
      editor.isDestroyed
    ) {
      return;
    }

    editor.commands.focus('end');
    setAiChatComposerShouldFocus(false);
  }, [aiChatComposerShouldFocus, editor, setAiChatComposerShouldFocus]);

  const draft = aiChatComposerDrafts[draftKey] ?? '';

  useEffect(() => {
    if (
      !isDefined(editor) ||
      editor.isDestroyed ||
      editor.isFocused ||
      serializeAiChatEditorDraft(editor) === draft
    ) {
      return;
    }

    editor.commands.setContent(
      deserializeAdvancedTextEditorDocument({ serializedDocument: draft }),
      { emitUpdate: false },
    );
  }, [draft, editor]);

  return { editor };
};
