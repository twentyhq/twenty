import { AI_CHAT_INPUT_ID } from '@/ai/constants/AiChatInputId';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { MENTION_SUGGESTION_PLUGIN_KEY } from '@/mention/constants/MentionSuggestionPluginKey';
import { MentionSuggestion } from '@/mention/extensions/MentionSuggestion';
import { MentionTag } from '@/mention/extensions/MentionTag';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { t } from '@lingui/core/macro';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Placeholder } from '@tiptap/extensions';
import { type Editor, useEditor } from '@tiptap/react';
import { useCallback, useMemo, useRef } from 'react';
import { useSetRecoilState } from 'recoil';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type UseAIChatEditorProps = {
  onSendMessage: () => void;
};

export const useAIChatEditor = ({ onSendMessage }: UseAIChatEditorProps) => {
  const setAgentChatInput = useSetRecoilState(agentChatInputState);
  const { searchMentionRecords } = useMentionSearch();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const onSendMessageRef = useRef(onSendMessage);
  onSendMessageRef.current = onSendMessage;

  const searchMentionRecordsRef = useRef(searchMentionRecords);
  searchMentionRecordsRef.current = searchMentionRecords;

  const stableSearchMentionRecords = useCallback(
    (query: string) => searchMentionRecordsRef.current(query),
    [],
  );

  const editorRef = useRef<Editor | null>(null);

  const handleSendAndClear = () => {
    onSendMessageRef.current();
    editorRef.current?.commands.clearContent();
  };

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
      MentionSuggestion.configure({
        searchMentionRecords: stableSearchMentionRecords,
      }),
    ],
    [stableSearchMentionRecords],
  );

  const editor = useEditor({
    extensions,
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          const suggestionState =
            MENTION_SUGGESTION_PLUGIN_KEY.getState(view.state);
          if (suggestionState?.active) {
            return false;
          }

          event.preventDefault();
          handleSendAndClear();
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

  editorRef.current = editor;

  return { editor, handleSendAndClear };
};
