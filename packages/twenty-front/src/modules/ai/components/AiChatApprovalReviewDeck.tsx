import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { CountPager } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatApprovalOutcome } from '@/ai/components/AiChatApprovalOutcome';
import { type AiChatApprovalReviewCard } from '@/ai/types/AiChatApprovalReviewCard';

const DECK_EDGE_HEIGHT_PX = 4;
const DECK_BACK_EDGE_INSET_PX = 16;
const DECK_MIDDLE_EDGE_INSET_PX = 8;
const DECK_HEADER_HEIGHT_PX = 24;
const DECK_HINT_MIN_WIDTH_PX = 160;

const StyledDeck = styled.div`
  min-width: 0;
  width: 100%;
`;

const StyledStackEdge = styled.div<{ inset: number }>`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-bottom: 0;
  border-radius: ${themeCssVariables.border.radius.sm}
    ${themeCssVariables.border.radius.sm} 0 0;
  box-sizing: border-box;
  height: ${DECK_EDGE_HEIGHT_PX}px;
  margin: 0 ${({ inset }) => inset}px;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${DECK_HEADER_HEIGHT_PX}px;
  min-width: 0;
  overflow-wrap: anywhere;
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledIcon = styled.span<{ isDestructive?: boolean }>`
  color: ${({ isDestructive }) =>
    isDestructive
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.secondary};
  display: inline-flex;
  flex-shrink: 0;
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1 1 ${DECK_HINT_MIN_WIDTH_PX}px;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 0;
  overflow-wrap: anywhere;
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  margin-left: auto;
`;

const StyledOutcome = styled.div`
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  padding: ${themeCssVariables.spacing[4]};
`;

type AiChatApprovalReviewDeckProps = {
  cards: readonly AiChatApprovalReviewCard[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onRequestApproval: (cardIds: string[]) => void;
  onDeny: (cardId: string) => void;
  disabled?: boolean;
  approveAllLabel?: string;
};

export const AiChatApprovalReviewDeck = ({
  cards,
  activeIndex,
  onActiveIndexChange,
  onRequestApproval,
  onDeny,
  disabled = false,
  approveAllLabel,
}: AiChatApprovalReviewDeckProps) => {
  const { t } = useLingui();
  const activeCard = cards[activeIndex];

  if (!isDefined(activeCard)) {
    return <StyledEmpty role="status">{t`No actions to review`}</StyledEmpty>;
  }

  const pendingCards = cards.filter((card) => card.status === 'pending');
  const pendingCardIds = pendingCards.map((card) => card.id);
  const hasSelectedItems = pendingCards.some((card) => card.selectedCount > 0);
  const isActiveCardPending = activeCard.status === 'pending';
  const canApproveActiveCard =
    !disabled &&
    isActiveCardPending &&
    !activeCard.isApprovalDisabled &&
    activeCard.selectedCount > 0;
  const canApproveAll =
    !disabled &&
    hasSelectedItems &&
    pendingCards.every((card) => !card.isApprovalDisabled);
  const pendingCardCount = pendingCards.length;
  const nextTitles = cards
    .filter((card, index) => index > activeIndex && card.status === 'pending')
    .map((card) => card.title)
    .join(', ');
  const selectionSummary = t`${activeCard.selectedCount} selected · ${activeCard.skippedCount} skipped`;
  const nextActionHint = isNonEmptyString(nextTitles)
    ? t`Next: ${nextTitles}`
    : selectionSummary;
  const hint =
    activeCard.skippedCount > 0
      ? selectionSummary
      : (activeCard.hint ?? nextActionHint);

  return (
    <StyledDeck aria-label={t`Approval review`} role="region">
      {cards.length > 2 && <StyledStackEdge inset={DECK_BACK_EDGE_INSET_PX} />}
      {cards.length > 1 && (
        <StyledStackEdge inset={DECK_MIDDLE_EDGE_INSET_PX} />
      )}
      <Card.Root
        fullWidth
        variant="compact"
        role="group"
        aria-label={activeCard.title}
      >
        <Card.Header>
          <StyledHeader>
            <StyledTitle>
              <StyledIcon
                aria-hidden="true"
                isDestructive={activeCard.isDestructive}
              >
                {activeCard.icon}
              </StyledIcon>
              {activeCard.title}
            </StyledTitle>
            {cards.length > 1 && (
              <CountPager
                index={activeIndex}
                count={cards.length}
                disabled={disabled}
                onIndexChange={onActiveIndexChange}
                positionText={`${activeIndex + 1}/${cards.length}`}
                previousLabel={t`Previous approval`}
                nextLabel={t`Next approval`}
              />
            )}
          </StyledHeader>
        </Card.Header>
        <Card.Content>{activeCard.content}</Card.Content>
        <div role="status" aria-atomic="true">
          {!isActiveCardPending && (
            <StyledOutcome>
              <AiChatApprovalOutcome
                status={activeCard.status}
                message={activeCard.outcomeMessage}
                progress={activeCard.progress}
              />
            </StyledOutcome>
          )}
        </div>
        <Card.Footer divider={false}>
          <StyledFooter>
            <StyledHint>{hint}</StyledHint>
            <StyledActions>
              <Button
                size="sm"
                variant="outline"
                disabled={disabled || !isActiveCardPending}
                onClick={() => onDeny(activeCard.id)}
              >
                {activeCard.denyLabel ?? t`Deny`}
              </Button>
              {pendingCardCount > 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!canApproveAll}
                  onClick={() => onRequestApproval(pendingCardIds)}
                >
                  {approveAllLabel ?? t`Approve all ${pendingCardCount}`}
                </Button>
              )}
              <Button
                size="sm"
                color={activeCard.isDestructive ? 'danger' : 'accent'}
                variant="solid"
                disabled={!canApproveActiveCard}
                loading={activeCard.status === 'running'}
                onClick={() => onRequestApproval([activeCard.id])}
              >
                {activeCard.approveLabel}
              </Button>
            </StyledActions>
          </StyledFooter>
        </Card.Footer>
      </Card.Root>
    </StyledDeck>
  );
};
