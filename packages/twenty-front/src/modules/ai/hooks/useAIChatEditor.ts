import { t } from '@lingui/core/macro';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Placeholder } from '@tiptap/extensions';
import { useEditor } from '@tiptap/react';
import { useCallback, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_INPUT_ID } from '@/ai/constants/AiChatInputId';
import { agentChatInputStateV2 } from '@/ai/states/agentChatInputStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { MENTION_SUGGESTION_PLUGIN_KEY } from '@/mention/constants/MentionSuggestionPluginKey';
import { MentionSuggestion } from '@/mention/extensions/MentionSuggestion';
import { MentionTag } from '@/mention/extensions/MentionTag';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type UseAIChatEditorProps = {
  onSendMessage: () => void;
};

export const useAIChatEditor = ({ onSendMessage }: UseAIChatEditorProps) => {
  const setAgentChatInput = useSetRecoilStateV2(agentChatInputStateV2);
  const { searchMentionRecords } = useMentionSearch();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

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
          onSendMessage();

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

  const handleSendAndClear = useCallback(() => {
    onSendMessage();
    editor?.commands.clearContent();
  }, [onSendMessage, editor]);

  return { editor, handleSendAndClear };
};
