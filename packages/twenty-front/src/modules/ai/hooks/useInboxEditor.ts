import { useCallback } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { useAdvancedTextEditor } from '@/advanced-text-editor/hooks/useAdvancedTextEditor';
import { deserializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/deserializeAdvancedTextEditorDocument';
import { serializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorDocument';
import { INBOX_EDITOR_PROFILE } from '@/ai/constants/InboxEditorProfile';
import { INBOX_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/InboxRestoreEditorContentEventName';
import { INBOX_INPUT_ID } from '@/ai/constants/InboxInputId';
import { useInboxFileUpload } from '@/ai/hooks/useInboxFileUpload';
import { useAiChatAssistantProfile } from '@/ai/hooks/useAiChatAssistantProfile';
import { inboxThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/inboxThreadIsDirectMessageFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { inboxDraftsByThreadIdState } from '@/ai/states/inboxDraftsByThreadIdState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { newInboxThreadIdState } from '@/ai/states/newInboxThreadIdState';
import { INBOX_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/InboxSendMessageEventName';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { MENTION_SUGGESTION_PLUGIN_KEY } from '@/mention/constants/MentionSuggestionPluginKey';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { getAgentChatAssistantMentionSearchResults } from '@/ai/utils/getAgentChatAssistantMentionSearchResults';
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
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';
import { useLingui } from '@lingui/react/macro';

export const useInboxEditor = () => {
  const { t } = useLingui();
  const { displayName: assistantDisplayName } = useAiChatAssistantProfile();
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const aiModels = useAtomStateValue(aiModelsState);
  const newInboxThreadId = useAtomStateValue(newInboxThreadIdState);
  const [inboxDraftsByThreadId, setInboxDraftsByThreadId] = useAtomState(
    inboxDraftsByThreadIdState,
  );
  const { searchMentionRecords } = useMentionSearch();
  const { searchWorkspaceMembers } = useWorkspaceMemberMentionSearch();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { searchSkills } = useSkillSuggestionSearch();
  const { uploadFiles } = useInboxFileUpload();
  const isDirectMessage = useAtomFamilySelectorValue(
    inboxThreadIsDirectMessageFamilySelector,
    currentInboxThread,
  );
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const draftKey = currentInboxThread ?? newInboxThreadId;
  const initialDraft = inboxDraftsByThreadId[draftKey] ?? '';
  const editor = useAdvancedTextEditor({
    profile: INBOX_EDITOR_PROFILE,
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
          dispatchBrowserEvent(INBOX_SEND_MESSAGE_EVENT_NAME);
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

      setInboxDraftsByThreadId((prev) => ({
        ...prev,
        [draftKey]: serializedDraft,
      }));
    },
    onFocus: () => {
      pushFocusItemToFocusStack({
        focusId: INBOX_INPUT_ID,
        component: {
          type: FocusComponentType.TEXT_AREA,
          instanceId: INBOX_INPUT_ID,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
    },
    onBlur: () => {
      removeFocusItemFromFocusStackById({ focusId: INBOX_INPUT_ID });
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
        ...getAgentChatAssistantMentionSearchResults({
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
    eventName: INBOX_RESTORE_EDITOR_CONTENT_EVENT_NAME,
    onBrowserEvent: handleRestoreEditorContent,
  });

  return { editor };
};
