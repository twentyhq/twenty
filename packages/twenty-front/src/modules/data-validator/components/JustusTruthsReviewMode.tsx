import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

import {
  type JustusTruthRecord,
  type ReviewAction,
  type SessionStats,
} from '@/data-validator/types/data-validator.types';

import { ReviewSessionStats } from './ReviewSessionStats';
import { TruthReviewCard } from './TruthReviewCard';

type JustusTruthsReviewModeProps = {
  currentTruth: JustusTruthRecord | null;
  onAction: (action: ReviewAction) => void;
  loading: boolean;
  isEmpty: boolean;
  sessionStats: SessionStats;
  averageReviewTime: number;
  totalReviewed: number;
};

type AnimationClass =
  | 'idle'
  | 'exit-right'
  | 'exit-left'
  | 'exit-down'
  | 'exit-up'
  | 'enter';

const ACTION_ANIMATION_MAP: Record<ReviewAction, AnimationClass> = {
  approve: 'exit-right',
  reject: 'exit-left',
  skip: 'exit-down',
  support: 'exit-up',
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(6)};
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledLoading = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  text-align: center;
`;

const StyledEmptyTitle = styled.h2`
  font-size: 24px;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
`;

const StyledEmptySubtext = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.secondary};
  margin: 0;
`;

const StyledKeyboardHintBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  flex-shrink: 0;
`;

const StyledHintItem = styled.span`
  white-space: nowrap;
`;

export const JustusTruthsReviewMode = ({
  currentTruth,
  onAction,
  loading,
  isEmpty,
  sessionStats,
  averageReviewTime,
  totalReviewed,
}: JustusTruthsReviewModeProps) => {
  const [animationClass, setAnimationClass] = useState<AnimationClass>('idle');
  const previousTruthId = useRef<string | null>(null);
  const pendingAction = useRef<ReviewAction | null>(null);

  // Detect when currentTruth changes to trigger enter animation
  useEffect(() => {
    if (
      currentTruth &&
      currentTruth.id !== previousTruthId.current &&
      animationClass !== 'idle'
    ) {
      setAnimationClass('enter');
      const timer = setTimeout(() => setAnimationClass('idle'), 300);
      return () => clearTimeout(timer);
    }
    previousTruthId.current = currentTruth?.id ?? null;
  }, [currentTruth, animationClass]);

  const handleAction = useCallback(
    (action: ReviewAction) => {
      if (animationClass !== 'idle') return;
      pendingAction.current = action;
      setAnimationClass(ACTION_ANIMATION_MAP[action]);

      setTimeout(() => {
        onAction(action);
        pendingAction.current = null;
      }, 300);
    },
    [animationClass, onAction],
  );

  if (loading) {
    return (
      <StyledContainer>
        <StyledLoading>Loading truths...</StyledLoading>
      </StyledContainer>
    );
  }

  if (isEmpty) {
    return (
      <StyledContainer>
        <StyledEmpty>
          <StyledEmptyTitle>All candidates reviewed!</StyledEmptyTitle>
          <StyledEmptySubtext>
            You have reviewed all available candidate truths.
          </StyledEmptySubtext>
          <ReviewSessionStats
            sessionStats={sessionStats}
            averageReviewTime={averageReviewTime}
            totalReviewed={totalReviewed}
          />
        </StyledEmpty>
      </StyledContainer>
    );
  }

  if (!currentTruth) {
    return (
      <StyledContainer>
        <StyledLoading>No truth to display</StyledLoading>
      </StyledContainer>
    );
  }

  return (
    <>
      <StyledContainer>
        <TruthReviewCard
          truth={currentTruth}
          animationClass={animationClass}
          onAction={handleAction}
        />
        <ReviewSessionStats
          sessionStats={sessionStats}
          averageReviewTime={averageReviewTime}
          totalReviewed={totalReviewed}
        />
      </StyledContainer>
      <StyledKeyboardHintBar>
        <StyledHintItem>&larr; Reject</StyledHintItem>
        <StyledHintItem>&darr; Skip</StyledHintItem>
        <StyledHintItem>S Support</StyledHintItem>
        <StyledHintItem>&rarr; Approve</StyledHintItem>
        <StyledHintItem>E Edit</StyledHintItem>
        <StyledHintItem>Z Undo</StyledHintItem>
        <StyledHintItem>? Help</StyledHintItem>
      </StyledKeyboardHintBar>
    </>
  );
};
