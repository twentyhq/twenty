import { filterSuggestionItems } from '@blocknote/core';
import { en } from '@blocknote/core/locales';
import { BlockNoteView } from '@blocknote/mantine';
import { SuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 } from 'uuid';

import { COMMENT_SCHEMA } from '@/activities/comments/constants/CommentSchema';
import {
  MentionSuggestionMenu,
  type MentionSuggestionItem,
} from '@/activities/comments/components/MentionSuggestionMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/ui/input/editor/constants/BlockEditorGlobalHotkeysConfig';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const StyledEditorContainer = styled.div`
  flex: 1;
  width: 100%;

  & .bn-container {
    width: 100%;
  }

  & .bn-editor {
    padding: 0;
    min-height: 24px;
    background: transparent;
    font-size: ${({ theme }) => theme.font.size.md};
    color: ${({ theme }) => theme.font.color.primary};
  }

  & .bn-block-group {
    padding: 0;
  }

  & .bn-block-outer {
    padding: 0;
    margin: 0;
  }

  & .bn-inline-content {
    width: 100%;
  }

  & .bn-inline-content:has(> .ProseMirror-trailingBreak):before {
    font-style: normal;
    color: ${({ theme }) => theme.font.color.tertiary};
  }

  & .bn-container .bn-side-menu,
  & .bn-container .bn-drag-handle {
    display: none;
  }
`;

type CommentEditorProps = {
  placeholder?: string;
  onContentChange?: (content: string, markdown: string) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onEditorReady?: (clearEditor: () => void) => void;
};

export const CommentEditor = ({
  placeholder,
  onContentChange,
  onKeyDown,
  onFocus,
  onBlur,
  onEditorReady,
}: CommentEditorProps) => {
  const theme = useTheme();
  const blockNoteTheme = theme.name === 'light' ? 'light' : 'dark';
  const [mentionQuery, setMentionQuery] = useState('');
  const focusIdRef = useRef(v4());

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const placeholderText = placeholder ?? t`Write a comment... Use @ to mention`;

  const dictionary = useMemo(
    () => ({
      ...en,
      placeholders: {
        ...en.placeholders,
        default: placeholderText,
        emptyDocument: placeholderText,
        paragraph: placeholderText,
      },
    }),
    [placeholderText],
  );

  const editor = useCreateBlockNote({
    schema: COMMENT_SCHEMA,
    dictionary,
    initialContent: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
  });

  const clearEditor = useCallback(() => {
    editor.removeBlocks(editor.document);
    editor.insertBlocks(
      [{ type: 'paragraph', content: [] }],
      editor.document[0],
      'before',
    );
  }, [editor]);

  useEffect(() => {
    onEditorReady?.(clearEditor);
  }, [clearEditor, onEditorReady]);

  const { searchRecords } = useObjectRecordSearchRecords({
    objectNameSingulars: [CoreObjectNameSingular.WorkspaceMember],
    searchInput: mentionQuery,
    limit: 10,
    skip: mentionQuery === '',
  });

  const getMentionItems = useCallback(
    (query: string): MentionSuggestionItem[] => {
      setMentionQuery(query);

      return searchRecords.map((searchRecord) => {
        return {
          id: searchRecord.recordId,
          title: searchRecord.label,
          avatarUrl: searchRecord.imageUrl,
          onItemClick: () => {
            editor.insertInlineContent([
              {
                type: 'mention',
                props: {
                  userId: searchRecord.recordId,
                  name: searchRecord.label,
                },
              },
              ' ',
            ]);
          },
        };
      });
    },
    [editor, searchRecords],
  );

  const handleChange = useCallback(() => {
    if (onContentChange) {
      const blocks = editor.document;
      const blocknoteJson = JSON.stringify(blocks);

      // Extract plain text for markdown
      let markdown = '';
      for (const block of blocks) {
        if (block.content && Array.isArray(block.content)) {
          for (const item of block.content) {
            if (item.type === 'text' && 'text' in item) {
              markdown += (item as { type: 'text'; text: string }).text;
            } else if (item.type === 'mention') {
              const mentionProps = item.props as { name?: string } | undefined;
              markdown += `@${mentionProps?.name || 'Unknown'}`;
            }
          }
        }
        markdown += '\n';
      }

      onContentChange(blocknoteJson, markdown.trim());
    }
  }, [editor, onContentChange]);

  const handleKeyDownWrapper = useCallback(
    (event: React.KeyboardEvent) => {
      onKeyDown?.(event);
    },
    [onKeyDown],
  );

  const handleFocus = useCallback(() => {
    pushFocusItemToFocusStack({
      focusId: focusIdRef.current,
      component: {
        type: FocusComponentType.COMMENT_EDITOR,
        instanceId: focusIdRef.current,
      },
      globalHotkeysConfig: BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG,
    });
    onFocus?.();
  }, [pushFocusItemToFocusStack, onFocus]);

  const handleBlur = useCallback(() => {
    removeFocusItemFromFocusStackById({
      focusId: focusIdRef.current,
    });
    onBlur?.();
  }, [removeFocusItemFromFocusStackById, onBlur]);

  return (
    <StyledEditorContainer onKeyDown={handleKeyDownWrapper}>
      <BlockNoteView
        editor={editor}
        theme={blockNoteTheme}
        slashMenu={false}
        sideMenu={false}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
      >
        <SuggestionMenuController<
          (query: string) => Promise<MentionSuggestionItem[]>
        >
          triggerCharacter="@"
          getItems={async (query) =>
            filterSuggestionItems(getMentionItems(query), query)
          }
          suggestionMenuComponent={MentionSuggestionMenu}
          onItemClick={(item) => item.onItemClick()}
        />
      </BlockNoteView>
    </StyledEditorContainer>
  );
};
