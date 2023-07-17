import { useEffect, useMemo, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { BlockNoteEditor } from '@blocknote/core';
import { useBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';
import debounce from 'lodash.debounce';

import { BlockEditor } from '@/ui/block-editor/components/BlockEditor';
import {
  CommentThread,
  useUpdateCommentThreadMutation,
} from '~/generated/graphql';

import { GET_COMMENT_THREADS_BY_TARGETS } from '../queries/select';

const BlockNoteStyledContainer = styled.div`
  width: 100%;
`;

type OwnProps = {
  commentThread: Pick<CommentThread, 'id' | 'body'>;
  onChange?: (commentThreadBody: string) => void;
};

export function CommentThreadBodyEditor({ commentThread, onChange }: OwnProps) {
  const [updateCommentThreadMutation] = useUpdateCommentThreadMutation();

  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    if (body) {
      onChange?.(body);
    }
  }, [body, onChange]);

  const debounceOnChange = useMemo(() => {
    function onInternalChange(commentThreadBody: string) {
      setBody(commentThreadBody);
      updateCommentThreadMutation({
        variables: {
          id: commentThread.id,
          body: commentThreadBody,
        },
        refetchQueries: [
          getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
        ],
      });
    }

    return debounce(onInternalChange, 200);
  }, [commentThread, updateCommentThreadMutation, setBody]);

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
