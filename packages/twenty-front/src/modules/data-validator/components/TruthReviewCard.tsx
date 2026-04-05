import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

import {
  type JustusTruthRecord,
  type ReviewAction,
} from '@/data-validator/types/data-validator.types';

type TruthReviewCardProps = {
  truth: JustusTruthRecord;
  animationClass: string;
  onAction: (action: ReviewAction) => void;
};

const DOMAIN_COLORS: Record<string, string> = {
  movement: '#3b82f6',
  pain_science: '#ef4444',
  coaching: '#22c55e',
  business: '#8b5cf6',
  mindset: '#f59e0b',
  nutrition: '#10b981',
  sales: '#f97316',
  none: '#6b7280',
};

const cardEnter = keyframes`
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const StyledCardWrapper = styled.div`
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
  padding: 32px;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 12px;
  background: ${({ theme }) => theme.background.primary};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &.exit-right {
    transform: translateX(120%) rotate(5deg);
    opacity: 0;
    transition: all 300ms ease-out;
  }

  &.exit-left {
    transform: translateX(-120%) rotate(-5deg);
    opacity: 0;
    transition: all 300ms ease-out;
  }

  &.exit-down {
    transform: translateY(120%);
    opacity: 0;
    transition: all 300ms ease-out;
  }

  &.exit-up {
    transform: translateY(-120%);
    opacity: 0;
    transition: all 300ms ease-out;
  }

  &.enter {
    transform: scale(0.95);
    opacity: 0;
    animation: ${cardEnter} 300ms ease-out forwards;
  }
`;

const StyledBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
`;

const StyledDomainBadge = styled.span<{ $color: string }>`
  display: inline-block;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 10px;
  color: #ffffff;
  background: ${({ $color }) => $color};
`;

const StyledClaimBadge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 10px;
  color: ${({ theme }) => theme.font.color.secondary};
  background: ${({ theme }) => theme.background.secondary};
`;

const StyledTruthText = styled.p`
  font-size: 20px;
  line-height: 1.6;
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0 0 24px 0;
  overflow-wrap: break-word;
`;

const StyledMetadata = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 28px;
`;

const StyledMetaItem = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};

  & strong {
    color: ${({ theme }) => theme.font.color.secondary};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
`;

const StyledActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const StyledActionButton = styled.button<{ $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 90px;
  padding: 12px 16px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  background: ${({ $color }) => $color};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 150ms ease, transform 100ms ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StyledKeyHint = styled.span`
  font-size: 11px;
  opacity: 0.7;
  font-weight: 400;
`;

export const TruthReviewCard = ({
  truth,
  animationClass,
  onAction,
}: TruthReviewCardProps) => {
  const domainColor =
    DOMAIN_COLORS[truth.domain ?? 'none'] ?? DOMAIN_COLORS.none;

  return (
    <StyledCardWrapper className={animationClass}>
      <StyledBadgeRow>
        {truth.domain && (
          <StyledDomainBadge $color={domainColor}>
            {truth.domain.replace('_', ' ')}
          </StyledDomainBadge>
        )}
        {truth.claimType && (
          <StyledClaimBadge>{truth.claimType}</StyledClaimBadge>
        )}
      </StyledBadgeRow>

      <StyledTruthText>{truth.truthText}</StyledTruthText>

      <StyledMetadata>
        {truth.contextSummary && (
          <StyledMetaItem>
            <strong>Context:</strong> {truth.contextSummary}
          </StyledMetaItem>
        )}
        {truth.meetingTopic && (
          <StyledMetaItem>
            <strong>Meeting:</strong> {truth.meetingTopic}
          </StyledMetaItem>
        )}
        {truth.sourceDate && (
          <StyledMetaItem>
            <strong>Date:</strong> {truth.sourceDate}
          </StyledMetaItem>
        )}
        {truth.evidenceCount !== null && truth.evidenceCount !== undefined && (
          <StyledMetaItem>
            <strong>Evidence:</strong> {truth.evidenceCount} source
            {truth.evidenceCount !== 1 ? 's' : ''}
          </StyledMetaItem>
        )}
        {truth.confidence && (
          <StyledMetaItem>
            <strong>Confidence:</strong> {truth.confidence}
          </StyledMetaItem>
        )}
      </StyledMetadata>

      <StyledActions>
        <StyledActionButton $color="#ef4444" onClick={() => onAction('reject')}>
          Reject
          <StyledKeyHint>&larr;</StyledKeyHint>
        </StyledActionButton>
        <StyledActionButton $color="#6b7280" onClick={() => onAction('skip')}>
          Skip
          <StyledKeyHint>&darr;</StyledKeyHint>
        </StyledActionButton>
        <StyledActionButton
          $color="#3b82f6"
          onClick={() => onAction('support')}
        >
          Support
          <StyledKeyHint>S</StyledKeyHint>
        </StyledActionButton>
        <StyledActionButton
          $color="#22c55e"
          onClick={() => onAction('approve')}
        >
          Approve
          <StyledKeyHint>&rarr;</StyledKeyHint>
        </StyledActionButton>
      </StyledActions>
    </StyledCardWrapper>
  );
};
