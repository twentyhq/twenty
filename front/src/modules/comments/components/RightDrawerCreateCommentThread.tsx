import { useEffect, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { BlockNoteEditor } from '@blocknote/core';
import { useBlockNote } from '@blocknote/react';
import { useTheme } from '@emotion/react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { GET_COMPANIES } from '@/companies/services';
import { GET_PEOPLE } from '@/people/services';
import { RightDrawerBody } from '@/ui/layout/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/layout/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/layout/right-drawer/components/RightDrawerTopBar';
import { useOpenRightDrawer } from '@/ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { logError } from '@/utils/logs/logError';
import { isDefined } from '@/utils/type-guards/isDefined';
import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';
import { useCreateCommentThreadWithCommentMutation } from '~/generated/graphql';

import { useOpenCommentThreadRightDrawer } from '../hooks/useOpenCommentThreadRightDrawer';
import { GET_COMMENT_THREAD } from '../services';
import { commentableEntityArrayState } from '../states/commentableEntityArrayState';

import { CommentThreadCreateMode } from './CommentThreadCreateMode';

export function RightDrawerCreateCommentThread() {
  const [title, setTitle] = useState('');

  const [commentableEntityArray] = useRecoilState(commentableEntityArrayState);

  const [createCommentThreadWithComment] =
    useCreateCommentThreadWithCommentMutation();

  const currentUser = useRecoilValue(currentUserState);

  const identifier = JSON.stringify(commentableEntityArray);

  const openCommentThreadRightDrawer = useOpenCommentThreadRightDrawer();

  function handleNewCommentThread(title: string, body: string) {
    if (!(isNonEmptyString(title) || isNonEmptyString(body))) {
      return;
    }

    if (!isDefined(currentUser)) {
      logError(
        'In handleCreateCommentThread, currentUser is not defined, this should not happen.',
      );
      return;
    }

    createCommentThreadWithComment({
      variables: {
        authorId: currentUser.id,
        body: body,
        title: title,
        commentThreadId: v4(),
        createdAt: new Date().toISOString(),
        commentThreadTargetArray: commentableEntityArray.map(
          (commentableEntity) => ({
            commentableId: commentableEntity.id,
            commentableType: commentableEntity.type,
            id: v4(),
            createdAt: new Date().toISOString(),
          }),
        ),
      },
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_COMMENT_THREAD) ?? '',
      ],
      onCompleted(data) {
        openCommentThreadRightDrawer(data.createOneCommentThread.id);
        localStorage.setItem('editorTitle' + identifier, '');
        localStorage.setItem('editorBody' + identifier, '');
      },
    });
  }

  const initialBody: string | null = localStorage.getItem(
    'editorBody' + identifier,
  );

  const editor: BlockNoteEditor | null = useBlockNote({
    theme: useTheme().name === 'light' ? 'light' : 'dark',
    initialContent: initialBody ? JSON.parse(initialBody) : undefined,
    onEditorContentChange: (editor) => {
      localStorage.setItem(
        'editorBody' + identifier,
        JSON.stringify(editor.topLevelBlocks),
      );
    },
  });

  useEffect(() => {
    const initialTitle: string =
      localStorage.getItem('editorTitle' + identifier) ?? '';
    setTitle(initialTitle);
  }, [identifier]);

  function onTitleUpdate(newTitle: string) {
    setTitle(newTitle);
    localStorage.setItem('editorTitle' + identifier, newTitle);
  }

  return (
    <RightDrawerPage>
      <RightDrawerTopBar
        title="New note"
        onClick={() =>
          handleNewCommentThread(title, JSON.stringify(editor?.topLevelBlocks))
        }
      />
      <RightDrawerBody>
        <CommentThreadCreateMode
          commentableEntityArray={commentableEntityArray}
          editor={editor}
          title={title}
          handleTitleChange={onTitleUpdate}
        />
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
