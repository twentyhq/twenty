import { useEffect, useMemo, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { BlockNoteEditor } from '@blocknote/core';
import { useBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';

import { GET_COMMENT_THREADS_BY_TARGETS } from '@/comments/services';
import { BlockEditor } from '@/ui/components/editor/BlockEditor';
import { debounce } from '@/utils/debounce';
import {
  CommentThread,
  useUpdateCommentThreadBodyMutation,
} from '~/generated/graphql';

const BlockNoteStyledContainer = styled.div`
  width: 100%;
`;

type OwnProps = {
  commentThread: Pick<CommentThread, 'id' | 'body'>;
  onChange?: (commentThreadBody: string) => void;
};

export function CommentThreadBodyEditor({ commentThread, onChange }: OwnProps) {
  const [updateCommentThreadBodyMutation] =
    useUpdateCommentThreadBodyMutation();

  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    if (body) {
      onChange?.(body);
    }
  }, [body, onChange]);

  const debounceOnChange = useMemo(() => {
    function onInternalChange(commentThreadBody: string) {
      setBody(commentThreadBody);
      updateCommentThreadBodyMutation({
        variables: {
          commentThreadId: commentThread.id,
          commentThreadBody: commentThreadBody,
        },
        refetchQueries: [
          getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
        ],
      });
    }

    return debounce(onInternalChange, 200);
  }, [commentThread, updateCommentThreadBodyMutation, setBody]);

  const editor: BlockNoteEditor | null = useBlockNote({
    initialContent: commentThread.body
      ? JSON.parse(commentThread.body)
      : undefined,
    editorDOMAttributes: { class: 'editor' },
    onEditorContentChange: (editor) => {
      debounceOnChange(JSON.stringify(editor.topLevelBlocks) ?? '');
    },
  });

  return (
    <BlockNoteStyledContainer>
      <BlockEditor editor={editor} />
    </BlockNoteStyledContainer>
  );
}
