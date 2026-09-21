import { useCallback, useEffect, useRef, useState } from 'react';

import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { createPortal } from 'react-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import {
  IconArrowBackUp,
  IconDotsVertical,
  IconLink,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { LightIconButton } from 'twenty-ui/components';
import { MenuItem } from 'twenty-ui/navigation';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { BlockEditor } from '@/blocknote-editor/components/BlockEditor';
import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/blocknote-editor/constants/BlockEditorGlobalHotkeysConfig';
import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';
import {
  type IssueCommentRecord,
  useIssueComments,
} from '@/task-manager/issue-detail/hooks/useIssueComments';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const EMPTY_PARAGRAPH = [{ type: 'paragraph' as const, content: '' }];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['3']};
`;

const StyledThread = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledComment = styled.div<{ isFocused?: boolean }>`
  background-color: ${({ isFocused }) =>
    isFocused ? themeCssVariables.background.transparent.light : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['1']};
  padding: ${themeCssVariables.spacing['1']};
  transition: background-color
    calc(${themeCssVariables.animation.duration.slow} * 1s);
`;

const StyledReplies = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['2']};
  margin-left: ${themeCssVariables.spacing['8']};
`;

// Thread line dropping from under the author avatar (spacing[1] padding +
// 24px avatar) into the replies block, where each reply's elbow picks it up.
const StyledParentComment = styled.div<{ hasReplies: boolean }>`
  position: relative;

  &::before {
    border-left: 1px solid
      ${({ hasReplies }) =>
        hasReplies ? themeCssVariables.border.color.medium : 'transparent'};
    bottom: calc(-1 * ${themeCssVariables.spacing['2']});
    content: '';
    left: ${themeCssVariables.spacing['4']};
    position: absolute;
    top: ${themeCssVariables.spacing['7']};
  }
`;

// ::before is the elbow curving into this reply's avatar, ::after continues
// the vertical line down to the next reply — so the line stops at the last
// reply instead of running past it.
const StyledReply = styled.div`
  position: relative;

  &::before {
    border-bottom: 1px solid ${themeCssVariables.border.color.medium};
    border-bottom-left-radius: ${themeCssVariables.border.radius.md};
    border-left: 1px solid ${themeCssVariables.border.color.medium};
    content: '';
    height: calc(
      ${themeCssVariables.spacing['2']} + ${themeCssVariables.spacing['4']}
    );
    left: calc(-1 * ${themeCssVariables.spacing['4']});
    position: absolute;
    top: calc(-1 * ${themeCssVariables.spacing['2']});
    width: ${themeCssVariables.spacing['5']};
  }

  &:not(:last-child)::after {
    border-left: 1px solid ${themeCssVariables.border.color.medium};
    bottom: calc(-1 * ${themeCssVariables.spacing['2']});
    content: '';
    left: calc(-1 * ${themeCssVariables.spacing['4']});
    position: absolute;
    top: ${themeCssVariables.spacing['4']};
  }
`;

const StyledReplyComposer = styled.div`
  margin-left: ${themeCssVariables.spacing['8']};
`;

const StyledCommentTopRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
`;

// Indent matches the avatar's width (size="lg" = 24px) + the row's gap, so
// the message lines up under the author name instead of the avatar.
const StyledCommentBody = styled.div`
  margin-left: calc(24px + ${themeCssVariables.spacing['2']});
`;

const StyledCommentHeader = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing['2']};
  min-width: 0;
`;

const StyledCommentAuthor = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledCommentDate = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

// Action row sits under the message, aligned with the body's indent (avatar
// width + the top row's gap) like Jira, not in the author/date header.
const StyledCommentActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['1']};
  margin-left: calc(24px + ${themeCssVariables.spacing['2']});
`;

// display:flex so this hugs the avatar's own size instead of stretching as
// a block-level flex item — it only exists to hold the hover-anchor id.
const StyledAvatarAnchor = styled.div`
  display: flex;
`;

// AppTooltip's default bubble is a translucent dark chip meant for a short
// line of text — fine for a plain tooltip, unreadable for a multi-line card.
// This cancels that chrome out so StyledAuthorCard's own opaque background
// is the only thing visible.
const authorCardTooltipClass = css`
  backdrop-filter: none !important;
  background-color: transparent !important;
  box-shadow: none !important;
  opacity: 1 !important;
  padding: 0 !important;
`;

// "xl" (40px) is Avatar's largest built-in size — override its fixed
// dimensions to go bigger, since there's no larger preset to switch to.
const authorCardAvatarClass = css`
  font-size: 36px !important;
  height: 96px !important;
  width: 96px !important;
`;

const StyledAuthorCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['2']};
  padding: ${themeCssVariables.spacing['3']};
  width: 220px;
`;

const StyledAuthorCardName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledAuthorCardDetail = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const AuthorInfoCard = ({
  authorName,
  avatarUrl,
  jobTitle,
  email,
}: {
  authorName: string;
  avatarUrl: string | undefined;
  jobTitle?: string | null;
  email?: string | null;
}) => (
  <StyledAuthorCard>
    <Avatar
      className={authorCardAvatarClass}
      placeholder={authorName}
      avatarUrl={avatarUrl}
      type="rounded"
      size="xl"
    />
    <StyledAuthorCardName>{authorName}</StyledAuthorCardName>
    {isNonEmptyString(jobTitle) && (
      <StyledAuthorCardDetail>{jobTitle}</StyledAuthorCardDetail>
    )}
    {isNonEmptyString(email) && (
      <StyledAuthorCardDetail>{email}</StyledAuthorCardDetail>
    )}
  </StyledAuthorCard>
);

const StyledCommentBodyEditor = styled.div`
  & .editor {
    min-height: 0;
  }
`;

const StyledComposer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledComposerEditor = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing['1']} ${themeCssVariables.spacing['2']};

  & .editor {
    min-height: 72px;
  }
`;

const StyledComposerActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
`;

const isEditorEmpty = (editor: typeof BLOCK_SCHEMA.BlockNoteEditor) =>
  editor.document.every(
    (block) => !Array.isArray(block.content) || block.content.length === 0,
  );

const getAuthorName = (
  author: IssueCommentRecord['author'],
  unknownLabel: string,
) =>
  author?.name
    ? `${author.name.firstName ?? ''} ${author.name.lastName ?? ''}`.trim()
    : unknownLabel;

// Without this, focusing the comment editor never suppresses global
// single-letter hotkeys (e/c/m/...), so typing a normal comment or reply
// fires whatever shortcut happens to share that letter — RichTextFieldEditor
// wires the exact same push/remove for the Description field's editor.
const useBlockEditorFocusHandlers = (focusId: string) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const handleBlockEditorFocus = useCallback(() => {
    pushFocusItemToFocusStack({
      component: {
        instanceId: focusId,
        type: FocusComponentType.ACTIVITY_RICH_TEXT_EDITOR,
      },
      focusId,
      globalHotkeysConfig: BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG,
    });
  }, [focusId, pushFocusItemToFocusStack]);

  const handleBlockEditorBlur = useCallback(() => {
    removeFocusItemFromFocusStackById({ focusId });
  }, [focusId, removeFocusItemFromFocusStackById]);

  return { handleBlockEditorFocus, handleBlockEditorBlur };
};

const CommentBody = ({
  blocknote,
}: {
  blocknote: string | null | undefined;
}) => {
  const editor = useCreateBlockNote({
    initialContent: parseInitialBlocknote(blocknote) ?? EMPTY_PARAGRAPH,
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
  });

  return (
    <StyledCommentBodyEditor>
      <BlockEditor editor={editor} readonly />
    </StyledCommentBodyEditor>
  );
};

const EditableCommentBody = ({
  commentId,
  blocknote,
  onSave,
  onCancel,
}: {
  commentId: string;
  blocknote: string | null | undefined;
  onSave: (blocknote: string) => Promise<void>;
  onCancel: () => void;
}) => {
  const { t } = useLingui();
  const [isSaving, setIsSaving] = useState(false);
  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const { handleBlockEditorFocus, handleBlockEditorBlur } =
    useBlockEditorFocusHandlers(`comment-edit-${commentId}`);

  const handleUploadFile = async (file: File) => {
    const { attachmentAbsoluteURL } = await uploadAttachmentFile(file, {
      id: commentId,
      targetObjectNameSingular: 'issueComment',
    });

    return attachmentAbsoluteURL;
  };

  const editor = useCreateBlockNote({
    initialContent: parseInitialBlocknote(blocknote) ?? EMPTY_PARAGRAPH,
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
    uploadFile: handleUploadFile,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(JSON.stringify(editor.document));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StyledComposer>
      <StyledComposerEditor>
        <BlockEditor
          editor={editor}
          onFocus={handleBlockEditorFocus}
          onBlur={handleBlockEditorBlur}
        />
      </StyledComposerEditor>
      <StyledComposerActions>
        <Button title={t`Cancel`} onClick={onCancel} disabled={isSaving} />
        <Button
          title={t`Save`}
          onClick={handleSave}
          disabled={isSaving}
          accent="blue"
        />
      </StyledComposerActions>
    </StyledComposer>
  );
};

type CommentComposerProps = {
  issueId: string;
  focusId: string;
  placeholder: string;
  submitLabel: string;
  onSubmit: (blocknote: string) => Promise<void>;
};

const CommentComposer = ({
  issueId,
  focusId,
  placeholder,
  submitLabel,
  onSubmit,
}: CommentComposerProps) => {
  const [hasContent, setHasContent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const { handleBlockEditorFocus, handleBlockEditorBlur } =
    useBlockEditorFocusHandlers(focusId);

  // The comment doesn't exist yet, so attachments uploaded while composing
  // are targeted at the parent issue instead of the not-yet-created comment.
  const handleUploadFile = async (file: File) => {
    const { attachmentAbsoluteURL } = await uploadAttachmentFile(file, {
      id: issueId,
      targetObjectNameSingular: 'issue',
    });

    return attachmentAbsoluteURL;
  };

  const editor = useCreateBlockNote({
    domAttributes: { editor: { class: 'editor' } },
    schema: BLOCK_SCHEMA,
    uploadFile: handleUploadFile,
    placeholders: {
      default: placeholder,
    },
    pasteHandler: ({ defaultPasteHandler }) =>
      defaultPasteHandler({
        plainTextAsMarkdown: true,
        prioritizeMarkdownOverHTML: true,
      }),
  });

  const handleChange = () => {
    setHasContent(!isEditorEmpty(editor));
  };

  const handleSend = async () => {
    if (isEditorEmpty(editor)) {
      return;
    }

    setIsSending(true);
    try {
      await onSubmit(JSON.stringify(editor.document));
      editor.replaceBlocks(editor.document, EMPTY_PARAGRAPH);
      setHasContent(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <StyledComposer>
      <StyledComposerEditor>
        <BlockEditor
          editor={editor}
          onChange={handleChange}
          onFocus={handleBlockEditorFocus}
          onBlur={handleBlockEditorBlur}
        />
      </StyledComposerEditor>
      <Button
        title={submitLabel}
        onClick={handleSend}
        disabled={isSending || !hasContent}
        accent="blue"
      />
    </StyledComposer>
  );
};

type CommentRowProps = {
  issueId: string;
  comment: IssueCommentRecord;
  currentWorkspaceMemberId: string | undefined;
  onUpdate: (commentId: string, blocknote: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReply?: () => void;
  isFocused?: boolean;
};

const CommentRow = ({
  issueId,
  comment,
  currentWorkspaceMemberId,
  onUpdate,
  onDelete,
  onReply,
  isFocused = false,
}: CommentRowProps) => {
  const { t } = useLingui();
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const { openModal } = useModal();
  const { closeDropdown } = useCloseDropdown();
  const { copyToClipboard } = useCopyToClipboard();
  const commentRowRef = useRef<HTMLDivElement>(null);

  const dropdownId = `issue-comment-menu-${comment.id}`;
  const deleteModalId = `issue-comment-delete-modal-${comment.id}`;
  const avatarAnchorId = `issue-comment-avatar-${comment.id}`;

  const isAuthor =
    isDefined(currentWorkspaceMemberId) &&
    isDefined(comment.authorId) &&
    comment.authorId === currentWorkspaceMemberId;

  const authorName = getAuthorName(comment.author, t`Unknown`);

  useEffect(() => {
    if (isFocused) {
      commentRowRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isFocused]);

  const handleEdit = () => {
    closeDropdown(dropdownId);
    setIsEditing(true);
  };

  const handleDeleteClick = () => {
    closeDropdown(dropdownId);
    openModal(deleteModalId);
  };

  const handleSaveEdit = async (blocknote: string) => {
    await onUpdate(comment.id, blocknote);
    setIsEditing(false);
  };

  const handleCopyCommentLink = () => {
    copyToClipboard(
      `${window.location.origin}${getAppPath(
        AppPath.TaskManagerIssuePage,
        { issueId },
        { commentId: comment.id },
      )}`,
      t`Link copied to clipboard`,
    );
  };

  return (
    <StyledComment ref={commentRowRef} isFocused={isFocused}>
      <StyledCommentTopRow>
        <StyledAvatarAnchor
          id={avatarAnchorId}
          onMouseEnter={() => setIsAvatarHovered(true)}
          onMouseLeave={() => setIsAvatarHovered(false)}
        >
          <Avatar
            placeholder={authorName}
            avatarUrl={getAbsoluteImageUrl(comment.author?.avatarUrl)}
            type="rounded"
            size="lg"
          />
        </StyledAvatarAnchor>
        {isAvatarHovered && (
          <AppTooltip
            anchorSelect={`#${avatarAnchorId}`}
            place="right-start"
            noArrow
            offset={8}
            delay={TooltipDelay.noDelay}
            className={authorCardTooltipClass}
            isOpen
          >
            <AuthorInfoCard
              authorName={authorName}
              avatarUrl={getAbsoluteImageUrl(comment.author?.avatarUrl)}
              jobTitle={comment.author?.jobTitle}
              email={comment.author?.userEmail}
            />
          </AppTooltip>
        )}
        <StyledCommentHeader>
          <StyledCommentAuthor>{authorName}</StyledCommentAuthor>
          <StyledCommentDate>
            {new Date(comment.createdAt).toLocaleString()}
          </StyledCommentDate>
        </StyledCommentHeader>
      </StyledCommentTopRow>
      <StyledCommentBody>
        {isEditing ? (
          <EditableCommentBody
            commentId={comment.id}
            blocknote={comment.bodyV2?.blocknote}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <CommentBody blocknote={comment.bodyV2?.blocknote} />
        )}
      </StyledCommentBody>
      <StyledCommentActions>
        <LightIconButton
          Icon={IconLink}
          accent="tertiary"
          title={t`Copy link`}
          onClick={handleCopyCommentLink}
        />
        {isDefined(onReply) && (
          <LightIconButton
            Icon={IconArrowBackUp}
            accent="tertiary"
            title={t`Reply`}
            onClick={onReply}
          />
        )}
        {isAuthor && (
          <Dropdown
            dropdownId={dropdownId}
            dropdownPlacement="bottom-end"
            clickableComponent={
              <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
            }
            dropdownComponents={
              <DropdownContent>
                <DropdownMenuItemsContainer>
                  <MenuItem
                    LeftIcon={IconPencil}
                    text={t`Edit`}
                    onClick={handleEdit}
                  />
                  <MenuItem
                    LeftIcon={IconTrash}
                    text={t`Delete`}
                    accent="danger"
                    onClick={handleDeleteClick}
                  />
                </DropdownMenuItemsContainer>
              </DropdownContent>
            }
          />
        )}
      </StyledCommentActions>
      {createPortal(
        <ConfirmationModal
          modalInstanceId={deleteModalId}
          title={t`Delete Comment`}
          subtitle={t`Are you sure you want to delete this comment? This action cannot be undone.`}
          onConfirmClick={() => onDelete(comment.id)}
          confirmButtonText={t`Delete Comment`}
        />,
        document.body,
      )}
    </StyledComment>
  );
};

type IssueCommentThreadProps = {
  issueId: string;
  focusedCommentId?: string;
};

export const IssueCommentThread = ({
  issueId,
  focusedCommentId,
}: IssueCommentThreadProps) => {
  const { t } = useLingui();
  const { comments, postComment, postReply, updateComment, deleteComment } =
    useIssueComments(issueId);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  return (
    <StyledContainer>
      <CommentComposer
        issueId={issueId}
        focusId={`comment-new-${issueId}`}
        placeholder={t`Write a comment...`}
        submitLabel={t`Comment`}
        onSubmit={(blocknote) =>
          postComment(blocknote, currentWorkspaceMember?.id)
        }
      />
      {comments.map((comment) => (
        <StyledThread key={comment.id}>
          <StyledParentComment hasReplies={comment.replies.length > 0}>
            <CommentRow
              issueId={issueId}
              comment={comment}
              currentWorkspaceMemberId={currentWorkspaceMember?.id}
              onUpdate={updateComment}
              onDelete={deleteComment}
              isFocused={comment.id === focusedCommentId}
              onReply={() =>
                setReplyingToId((current) =>
                  current === comment.id ? null : comment.id,
                )
              }
            />
          </StyledParentComment>
          {comment.replies.length > 0 && (
            <StyledReplies>
              {comment.replies.map((reply) => (
                <StyledReply key={reply.id}>
                  <CommentRow
                    issueId={issueId}
                    comment={reply}
                    currentWorkspaceMemberId={currentWorkspaceMember?.id}
                    onUpdate={updateComment}
                    onDelete={deleteComment}
                    isFocused={reply.id === focusedCommentId}
                  />
                </StyledReply>
              ))}
            </StyledReplies>
          )}
          {replyingToId === comment.id && (
            <StyledReplyComposer>
              <CommentComposer
                issueId={issueId}
                focusId={`comment-reply-${comment.id}`}
                placeholder={t`Write a reply...`}
                submitLabel={t`Reply`}
                onSubmit={async (blocknote) => {
                  await postReply(
                    comment.id,
                    blocknote,
                    currentWorkspaceMember?.id,
                  );
                  setReplyingToId(null);
                }}
              />
            </StyledReplyComposer>
          )}
        </StyledThread>
      ))}
    </StyledContainer>
  );
};
