import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconComment } from '@/ui/icons';

export type CommentChipProps = {
  count: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

const StyledChip = styled.div`
  align-items: center;
  backdrop-filter: blur(6px);

  background: ${({ theme }) => theme.background.transparent.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};

  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  gap: 4px;

  height: 26px;
  justify-content: center;

  max-width: 42px;

  padding-left: 4px;

  padding-right: 4px;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    color: ${({ theme }) => theme.font.color.tertiary};
  }

  user-select: none;
`;

const StyledCount = styled.div`
  align-items: center;
  display: flex;
  font-size: 12px;

  font-weight: 500;
  justify-content: center;
`;

export function CommentChip({ count, onClick }: CommentChipProps) {
  const theme = useTheme();

  if (count === 0) return null;
  const formattedCount = count > 99 ? '99+' : count;

  return (
    <StyledChip data-testid="comment-chip" onClick={onClick}>
      <StyledCount>{formattedCount}</StyledCount>
      <IconComment size={theme.icon.size.md} />
    </StyledChip>
  );
}
