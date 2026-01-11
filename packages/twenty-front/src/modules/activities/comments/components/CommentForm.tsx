import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useCreateComment } from '@/activities/comments/hooks/useCreateComment';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { TextArea } from '@/ui/input/components/TextArea';
import { Avatar } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledInputRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: flex-start;
`;

const StyledTextAreaContainer = styled.div`
  flex: 1;
`;

const StyledButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type CommentFormProps = {
  targetableObject: ActivityTargetableObject;
  onCommentCreated?: () => void;
};

export const CommentForm = ({
  targetableObject,
  onCommentCreated,
}: CommentFormProps) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createComment } = useCreateComment();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const authorName = currentWorkspaceMember
    ? `${currentWorkspaceMember.name.firstName} ${currentWorkspaceMember.name.lastName}`.trim()
    : 'You';

  const handleSubmit = useCallback(async () => {
    if (!commentText.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createComment(
        {
          body: {
            blocknote: JSON.stringify([
              {
                type: 'paragraph',
                content: [{ type: 'text', text: commentText }],
              },
            ]),
            markdown: commentText,
          },
          authorId: currentWorkspaceMember?.id,
        },
        [targetableObject],
      );

      setCommentText('');
      onCommentCreated?.();
    } finally {
      setIsSubmitting(false);
    }
  }, [
    commentText,
    isSubmitting,
    createComment,
    currentWorkspaceMember?.id,
    targetableObject,
    onCommentCreated,
  ]);

  const handleCancel = useCallback(() => {
    setCommentText('');
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <StyledFormContainer>
      <StyledInputRow>
        <Avatar
          avatarUrl={currentWorkspaceMember?.avatarUrl ?? undefined}
          placeholderColorSeed={currentWorkspaceMember?.id}
          placeholder={authorName}
          size="md"
          type="rounded"
        />
        <StyledTextAreaContainer onKeyDown={handleKeyDown}>
          <TextArea
            textAreaId="comment-form-textarea"
            placeholder={t`Write a comment...`}
            value={commentText}
            onChange={setCommentText}
            minRows={2}
            maxRows={8}
          />
        </StyledTextAreaContainer>
      </StyledInputRow>
      {commentText.trim() && (
        <StyledButtonRow>
          <Button
            title={t`Cancel`}
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          />
          <Button
            title={t`Send`}
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !commentText.trim()}
          />
        </StyledButtonRow>
      )}
    </StyledFormContainer>
  );
};
