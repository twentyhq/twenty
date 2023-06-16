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

  background: ${(props) => props.theme.primaryBackgroundTransparent};
  border-radius: ${(props) => props.theme.borderRadius};

  color: ${(props) => props.theme.text30};
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
    background: ${(props) => props.theme.tertiaryBackground};
    color: ${(props) => props.theme.text40};
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
      <IconComment size={theme.iconSizeMedium} />
    </StyledChip>
  );
}
