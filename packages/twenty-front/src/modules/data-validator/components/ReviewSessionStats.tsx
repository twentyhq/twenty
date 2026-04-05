import styled from '@emotion/styled';

import { type SessionStats } from '@/data-validator/types/data-validator.types';

type ReviewSessionStatsProps = {
  sessionStats: SessionStats;
  averageReviewTime: number;
  totalReviewed: number;
};

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  flex-wrap: wrap;
`;

const StyledStatItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledDot = styled.span<{ $color: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const StyledSeparator = styled.span`
  color: ${({ theme }) => theme.border.color.medium};
`;

export const ReviewSessionStats = ({
  sessionStats,
  averageReviewTime,
  totalReviewed,
}: ReviewSessionStatsProps) => {
  return (
    <StyledContainer>
      <StyledStatItem>
        <StyledDot $color="#22c55e" />
        Approved: {sessionStats.approved}
      </StyledStatItem>
      <StyledStatItem>
        <StyledDot $color="#ef4444" />
        Rejected: {sessionStats.rejected}
      </StyledStatItem>
      <StyledStatItem>
        <StyledDot $color="#3b82f6" />
        Supported: {sessionStats.supported}
      </StyledStatItem>
      <StyledStatItem>
        <StyledDot $color="#6b7280" />
        Skipped: {sessionStats.skipped}
      </StyledStatItem>
      <StyledSeparator>|</StyledSeparator>
      <StyledStatItem>Avg: {averageReviewTime}s/review</StyledStatItem>
      <StyledStatItem>Total: {totalReviewed}</StyledStatItem>
    </StyledContainer>
  );
};
