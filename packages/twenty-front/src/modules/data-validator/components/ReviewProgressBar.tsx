import styled from '@emotion/styled';

import { type ValidatorViewMode } from '@/data-validator/types/data-validator.types';

type ReviewProgressBarProps = {
  reviewedCount: number;
  totalCount: number;
  progressPercent: number;
  streak: number;
  viewMode: ValidatorViewMode;
  onToggleViewMode: () => void;
};

const StyledBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  background: ${({ theme }) => theme.background.primary};
  flex-shrink: 0;
`;

const StyledLeft = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  white-space: nowrap;
`;

const StyledCenter = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const StyledTrack = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 2px;
  overflow: hidden;
`;

const StyledFill = styled.div<{ $percent: number }>`
  width: ${({ $percent }) => $percent}%;
  height: 100%;
  background: #22c55e;
  border-radius: 2px;
  transition: width 300ms ease;
`;

const StyledRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  white-space: nowrap;
`;

const StyledStreak = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledToggle = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(3)};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-family: ${({ theme }) => theme.font.family};
  color: ${({ theme }) => theme.font.color.secondary};
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  transition: background 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.border.color.medium};
  }
`;

export const ReviewProgressBar = ({
  reviewedCount,
  totalCount,
  progressPercent,
  streak,
  viewMode,
  onToggleViewMode,
}: ReviewProgressBarProps) => {
  return (
    <StyledBar>
      <StyledLeft>
        {reviewedCount} / {totalCount} reviewed
      </StyledLeft>
      <StyledCenter>
        <StyledTrack>
          <StyledFill $percent={progressPercent} />
        </StyledTrack>
      </StyledCenter>
      <StyledRight>
        {streak > 0 && <StyledStreak>Streak: {streak}</StyledStreak>}
        <StyledToggle onClick={onToggleViewMode}>
          {viewMode === 'review' ? 'List' : 'Review'}
        </StyledToggle>
      </StyledRight>
    </StyledBar>
  );
};
