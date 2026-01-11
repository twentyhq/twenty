import styled from '@emotion/styled';
import { formatDistanceToNow } from 'date-fns';
import { useRecoilValue } from 'recoil';

import { useDeleteComment } from '@/activities/comments/hooks/useDeleteComment';
import { type Comment } from '@/activities/comments/types/Comment';
import { getActivityPreview } from '@/activities/utils/getActivityPreview';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { Avatar, IconDotsVertical, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

const StyledCommentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledCommentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledAuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledAuthorName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledTimestamp = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledCommentBody = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const StyledActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type CommentTileProps = {
  comment: Comment;
  onDelete?: () => void;
};

export const CommentTile = ({ comment, onDelete }: CommentTileProps) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { deleteComment } = useDeleteComment();
  const dropdownId = `comment-actions-${comment.id}`;
  const { closeDropdown } = useCloseDropdown();

  const authorName = comment.author
    ? `${comment.author.name.firstName} ${comment.author.name.lastName}`.trim()
    : 'Unknown';

  const body = getActivityPreview(comment.body?.blocknote ?? null);

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  const isOwnComment = currentWorkspaceMember?.id === comment.authorId;

  const handleDelete = async () => {
    await deleteComment(comment.id);
    closeDropdown(dropdownId);
    onDelete?.();
  };

  return (
    <StyledCommentContainer>
      <StyledCommentHeader>
        <StyledAuthorInfo>
          <Avatar
            avatarUrl={comment.author?.avatarUrl ?? undefined}
            placeholderColorSeed={comment.author?.id}
            placeholder={authorName}
            size="md"
            type="rounded"
          />
          <StyledAuthorName>{authorName}</StyledAuthorName>
          <StyledTimestamp>{timeAgo}</StyledTimestamp>
        </StyledAuthorInfo>
        {isOwnComment && (
          <StyledActionsContainer>
            <Dropdown
              dropdownId={dropdownId}
              clickableComponent={
                <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
              }
              dropdownComponents={
                <DropdownContent
                  widthInPixels={GenericDropdownContentWidth.Narrow}
                >
                  <DropdownMenuItemsContainer>
                    <MenuItem
                      LeftIcon={IconTrash}
                      text="Delete"
                      onClick={handleDelete}
                      accent="danger"
                    />
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          </StyledActionsContainer>
        )}
      </StyledCommentHeader>
      <StyledCommentBody>{body}</StyledCommentBody>
    </StyledCommentContainer>
  );
};
