import { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

import {
  type JustusTruthRecord,
  type ReviewAction,
  type SessionStats,
} from '@/data-validator/types/data-validator.types';

import { ReviewSessionStats } from './ReviewSessionStats';
import { TruthReviewCard } from './TruthReviewCard';

type PendingAction = {
  action: ReviewAction;
  reason: string;
} | null;

type JustusTruthsReviewModeProps = {
  currentTruth: JustusTruthRecord | null;
  onAction: (action: ReviewAction) => void;
  loading: boolean;
  isEmpty: boolean;
  sessionStats: SessionStats;
  averageReviewTime: number;
  totalReviewed: number;
  pendingAction: PendingAction;
  confirming: boolean;
  onPendingReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onConfirmComplete: () => void;
  onCancel: () => void;
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

const CONFIRMATION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  approve: { bg: 'rgba(34, 197, 94, 0.08)', border: '#22c55e', text: 'Approve this truth?' },
  reject: { bg: 'rgba(239, 68, 68, 0.08)', border: '#ef4444', text: 'Reject this truth?' },
  support: { bg: 'rgba(59, 130, 246, 0.08)', border: '#3b82f6', text: 'Mark as needs more evidence?' },
};

const StyledConfirmationBar = styled.div<{ $borderColor: string; $bgColor: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  border: 1px solid ${({ $borderColor }) => $borderColor};
  border-radius: 8px;
  background: ${({ $bgColor }) => $bgColor};
  max-width: 700px;
  width: 100%;
  flex-wrap: wrap;
`;

const StyledConfirmText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledReasonTextarea = styled.textarea`
  flex: 1;
  min-width: 180px;
  padding: 6px 10px;
  font-size: 13px;
  font-family: inherit;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 6px;
  background: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.primary};
  resize: none;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledConfirmButton = styled.button<{ $color: string }>`
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: #ffffff;
  background: ${({ $color }) => $color};
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const StyledCancelButton = styled.button`
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: ${({ theme }) => theme.font.color.secondary};
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

export const JustusTruthsReviewMode = ({
  currentTruth,
  onAction,
  loading,
  isEmpty,
  sessionStats,
  averageReviewTime,
  totalReviewed,
  pendingAction,
  confirming,
  onPendingReasonChange,
  onConfirm,
  onConfirmComplete,
  onCancel,
}: JustusTruthsReviewModeProps) => {
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const [animationClass, setAnimationClass] = useState<AnimationClass>('idle');
  const previousTruthId = useRef<string | null>(null);
  const isAnimating = useRef(false);

  // Detect when currentTruth changes to trigger enter animation
  useEffect(() => {
    if (
      currentTruth &&
      currentTruth.id !== previousTruthId.current &&
      previousTruthId.current !== null
    ) {
      setAnimationClass('enter');
      const timer = setTimeout(() => {
        setAnimationClass('idle');
        isAnimating.current = false;
      }, 300);
      previousTruthId.current = currentTruth.id;
      return () => clearTimeout(timer);
    }
    previousTruthId.current = currentTruth?.id ?? null;
  }, [currentTruth]);

  // Button click: go straight to pending (no animation yet)
  const handleButtonAction = useCallback(
    (action: ReviewAction) => {
      if (isAnimating.current) return;
      onAction(action);
    },
    [onAction],
  );

  // When confirming becomes true, play exit animation then call onConfirmComplete
  useEffect(() => {
    if (!confirming || !pendingAction || isAnimating.current) return;
    isAnimating.current = true;
    setAnimationClass(ACTION_ANIMATION_MAP[pendingAction.action]);

    const timer = setTimeout(() => {
      onConfirmComplete();
    }, 300);
    return () => clearTimeout(timer);
  }, [confirming, pendingAction, onConfirmComplete]);

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
          onAction={handleButtonAction}
          pendingAction={pendingAction?.action ?? null}
        />
        {pendingAction && (() => {
          const colors = CONFIRMATION_COLORS[pendingAction.action];
          if (!colors) return null;
          return (
            <StyledConfirmationBar $borderColor={colors.border} $bgColor={colors.bg}>
              <StyledConfirmText>{colors.text}</StyledConfirmText>
              {pendingAction.action === 'reject' && (
                <StyledReasonTextarea
                  ref={reasonRef}
                  placeholder="Optional reason..."
                  value={pendingAction.reason}
                  onChange={(e) => onPendingReasonChange(e.target.value)}
                  rows={1}
                />
              )}
              <StyledConfirmButton $color={colors.border} onClick={onConfirm}>
                Confirm (Enter)
              </StyledConfirmButton>
              <StyledCancelButton onClick={onCancel}>
                Cancel (Esc)
              </StyledCancelButton>
            </StyledConfirmationBar>
          );
        })()}
        <ReviewSessionStats
          sessionStats={sessionStats}
          averageReviewTime={averageReviewTime}
          totalReviewed={totalReviewed}
        />
      </StyledContainer>
      <StyledKeyboardHintBar>
        <StyledHintItem>&larr; Reject</StyledHintItem>
        <StyledHintItem>&darr; Skip</StyledHintItem>
        <StyledHintItem>&uarr; Support</StyledHintItem>
        <StyledHintItem>&rarr; Approve</StyledHintItem>
        <StyledHintItem>Enter Confirm</StyledHintItem>
        <StyledHintItem>Esc Cancel</StyledHintItem>
        <StyledHintItem>E Edit</StyledHintItem>
        <StyledHintItem>Z Undo</StyledHintItem>
        <StyledHintItem>? Help</StyledHintItem>
      </StyledKeyboardHintBar>
    </>
  );
};
