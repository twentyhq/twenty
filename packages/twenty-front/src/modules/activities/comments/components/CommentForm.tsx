import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { CommentEditor } from '@/activities/comments/components/CommentEditor';
import { useCreateComment } from '@/activities/comments/hooks/useCreateComment';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Avatar } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { isDefined } from 'twenty-shared/utils';

const StyledFormContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledInputRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledEditorContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex: 1;
  min-height: 32px;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};

  &:focus-within {
    border-color: ${({ theme }) => theme.color.blue};
  }
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
  const [blocknoteContent, setBlocknoteContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clearEditorFn, setClearEditorFn] = useState<(() => void) | null>(null);
  const { createComment } = useCreateComment();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const authorName = isDefined(currentWorkspaceMember)
    ? `${currentWorkspaceMember.name.firstName} ${currentWorkspaceMember.name.lastName}`.trim()
    : 'You';

  const hasContent = markdownContent.trim().length > 0;

  const handleContentChange = useCallback(
    (blocknote: string, markdown: string) => {
      setBlocknoteContent(blocknote);
      setMarkdownContent(markdown);
    },
    [],
  );

  const handleEditorReady = useCallback((clearEditor: () => void) => {
    setClearEditorFn(() => clearEditor);
  }, []);

  const clearEditor = useCallback(() => {
    if (isDefined(clearEditorFn)) {
      clearEditorFn();
    }
    setBlocknoteContent('');
    setMarkdownContent('');
  }, [clearEditorFn]);

  const handleSubmit = useCallback(async () => {
    if (!hasContent || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createComment(
        {
          body: {
            blocknote: blocknoteContent,
            markdown: markdownContent,
          },
          authorId: currentWorkspaceMember?.id,
        },
        [targetableObject],
      );

      clearEditor();
      onCommentCreated?.();
    } finally {
      setIsSubmitting(false);
    }
  }, [
    hasContent,
    isSubmitting,
    createComment,
    blocknoteContent,
    markdownContent,
    currentWorkspaceMember?.id,
    targetableObject,
    clearEditor,
    onCommentCreated,
  ]);

  const handleCancel = useCallback(() => {
    clearEditor();
  }, [clearEditor]);

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
        <StyledEditorContainer>
          <CommentEditor
            placeholder={t`Write a comment... Use @ to mention`}
            onContentChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onEditorReady={handleEditorReady}
          />
        </StyledEditorContainer>
      </StyledInputRow>
      {hasContent && (
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
            disabled={isSubmitting || !hasContent}
          />
        </StyledButtonRow>
      )}
    </StyledFormContainer>
  );
};
