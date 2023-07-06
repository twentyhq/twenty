import { getOperationName } from '@apollo/client/utilities';
import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView, useBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { commentableEntityArrayState } from '@/comments/states/commentableEntityArrayState';
import { createdCommentThreadIdState } from '@/comments/states/createdCommentThreadIdState';
import CompanyChip from '@/companies/components/CompanyChip';
import { GET_COMPANIES } from '@/companies/services';
import { GET_PEOPLE } from '@/people/services';
import { AutosizeTextInput } from '@/ui/components/inputs/AutosizeTextInput';
import { PropertyBox } from '@/ui/components/property-box/PropertyBox';
import { PropertyBoxItem } from '@/ui/components/property-box/PropertyBoxItem';
import { IconArrowUpRight } from '@/ui/icons/index';
import { useOpenRightDrawer } from '@/ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { logError } from '@/utils/logs/logError';
import { isDefined } from '@/utils/type-guards/isDefined';
import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';
import {
  useCreateCommentMutation,
  useCreateCommentThreadWithCommentMutation,
  useGetCommentThreadQuery,
} from '~/generated/graphql';

import { GET_COMMENT_THREAD } from '../services';

import { CommentThreadItem } from './CommentThreadItem';
import { CommentThreadRelationPicker } from './CommentThreadRelationPicker';

import '@blocknote/core/style.css';

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};

  justify-content: flex-start;

  max-height: calc(100% - 16px);
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledThreadItemListContainer = styled.div`
  align-items: flex-start;
  display: flex;

  flex-direction: column-reverse;
  gap: ${({ theme }) => theme.spacing(4)};

  justify-content: flex-start;
  overflow: auto;

  width: 100%;
`;

const BlockNoteStyledContainer = styled.div`
  width: 100%;
`;

export function CommentThreadCreateMode() {
  const [commentableEntityArray] = useRecoilState(commentableEntityArrayState);

  const [createdCommmentThreadId, setCreatedCommentThreadId] = useRecoilState(
    createdCommentThreadIdState,
  );

  const openRightDrawer = useOpenRightDrawer();

  const [createCommentMutation] = useCreateCommentMutation();

  const [createCommentThreadWithComment] =
    useCreateCommentThreadWithCommentMutation();

  const { data } = useGetCommentThreadQuery({
    variables: {
      commentThreadId: createdCommmentThreadId ?? '',
    },
    skip: !createdCommmentThreadId,
  });

  const comments = data?.findManyCommentThreads[0]?.comments;

  const displayCommentList = (comments?.length ?? 0) > 0;

  const currentUser = useRecoilValue(currentUserState);

  function handleNewComment(commentText: string) {
    if (!isNonEmptyString(commentText)) {
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
        commentText: commentText,
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
        setCreatedCommentThreadId(data.createOneCommentThread.id);
        openRightDrawer('comments');
      },
    });
  }

  const editor: BlockNoteEditor | null = useBlockNote({
    theme: 'light',
  });

  return (
    <StyledContainer>
      {displayCommentList && (
        <StyledThreadItemListContainer>
          {comments?.map((comment) => (
            <CommentThreadItem key={comment.id} comment={comment} />
          ))}
        </StyledThreadItemListContainer>
      )}
      <PropertyBox>
        <PropertyBoxItem
          icon={<IconArrowUpRight />}
          value={
            <CommentThreadRelationPicker preselected={commentableEntityArray} />
          }
          label="Relations"
        />
      </PropertyBox>
      <AutosizeTextInput minRows={5} onValidate={handleNewComment} />
      <BlockNoteStyledContainer>
        <BlockNoteView editor={editor} />
      </BlockNoteStyledContainer>
    </StyledContainer>
  );
}
