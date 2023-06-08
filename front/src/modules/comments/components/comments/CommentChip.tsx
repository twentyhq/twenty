import styled from '@emotion/styled';

import { IconComment } from '@/ui/icons';

export type CommentChipProps = {
  count: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

const StyledChip = styled.div`
  height: 26px;
  max-width: 42px;

  padding-left: 4px;
  padding-right: 4px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 4px;

  background: ${(props) => props.theme.primaryBackgroundTransparent};
  backdrop-filter: blur(6px);

  border-radius: ${(props) => props.theme.borderRadius};

  cursor: pointer;

  color: ${(props) => props.theme.text30};

  &:hover {
    background: ${(props) => props.theme.tertiaryBackground};
    color: ${(props) => props.theme.text40};
  }

  user-select: none;
`;

const StyledCount = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 12px;
  font-weight: 500;
`;

export function CommentChip({ count, onClick }: CommentChipProps) {
  if (count === 0) return null;
  const formattedCount = count > 99 ? '99+' : count;

  return (
    <StyledChip data-testid="comment-chip" onClick={onClick}>
      <StyledCount>{formattedCount}</StyledCount>
      <IconComment size={16} />
    </StyledChip>
  );
}
