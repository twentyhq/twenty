import styled from '@emotion/styled';
import { IconComment } from '../icons';

export type CommentChipProps = {
  count: number;
  onClick?: () => void;
};

const StyledChip = styled.div`
  height: 26px;
  min-width: 34px;

  padding-left: 2px;
  padding-right: 2px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 2px;

  background: ${(props) => props.theme.secondaryBackgroundTransparent};
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
  const formattedCount = count > 99 ? '99+' : count;

  return (
    <StyledChip onClick={onClick}>
      <StyledCount>{formattedCount}</StyledCount>
      <IconComment size={12} />
    </StyledChip>
  );
}
