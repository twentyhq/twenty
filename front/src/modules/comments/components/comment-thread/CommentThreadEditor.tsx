import { useMemo } from 'react';
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
};

export function CommentThreadEditor({ commentThread }: OwnProps) {
  const [updateCommentThreadBodyMutation] =
    useUpdateCommentThreadBodyMutation();

  const debounceUpdateCommentThreadBodyMutation = useMemo(() => {
    return debounce(updateCommentThreadBodyMutation, 200);
  }, [updateCommentThreadBodyMutation]);

  const editor: BlockNoteEditor | null = useBlockNote({
    initialContent: commentThread.body
      ? JSON.parse(commentThread.body)
      : undefined,
    editorDOMAttributes: { class: 'editor-edit-mode' },
    onEditorContentChange: (editor) => {
      debounceUpdateCommentThreadBodyMutation({
        variables: {
          commentThreadId: commentThread.id,
          commentThreadBody: JSON.stringify(editor.topLevelBlocks) ?? '',
        },
        refetchQueries: [
          getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
        ],
      });
    },
  });

  return (
    <BlockNoteStyledContainer>
      <BlockEditor editor={editor} />
    </BlockNoteStyledContainer>
  );
}
