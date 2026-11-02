import { styled } from '@linaria/react';
import { Plural, useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { AlertDialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AiChatApprovalReviewSummary } from '@/ai/types/AiChatApprovalReviewSummary';

const StyledList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledItem = styled.li`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  overflow-wrap: anywhere;
`;

type AiChatApprovalConfirmationProps = {
  cards: readonly AiChatApprovalReviewSummary[];
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
  selectionSummary?: ReactNode;
};

export const AiChatApprovalConfirmation = ({
  cards,
  onConfirm,
  onCancel,
  disabled = false,
  selectionSummary,
}: AiChatApprovalConfirmationProps) => {
  const { t } = useLingui();
  const cardCount = cards.length;
  const selectedCount = cards.reduce(
    (count, card) => count + card.selectedCount,
    0,
  );
  const skippedCount = cards.reduce(
    (count, card) => count + card.skippedCount,
    0,
  );

  return (
    <AlertDialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !disabled) {
          onCancel();
        }
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Viewport>
          <AlertDialog.Popup>
            <AlertDialog.Header>
              <AlertDialog.Title>
                <Plural
                  value={cardCount}
                  one="Approve # action?"
                  other="Approve # actions?"
                />
              </AlertDialog.Title>
              <AlertDialog.Description>
                {selectionSummary ??
                  t`${selectedCount} records selected · ${skippedCount} records skipped`}
              </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <StyledList>
                {cards.map((card) => (
                  <StyledItem key={card.id}>
                    <span>{card.title}</span>
                    <span>{t`${card.selectedCount} selected · ${card.skippedCount} skipped`}</span>
                  </StyledItem>
                ))}
              </StyledList>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={onCancel}
              >
                {t`Cancel`}
              </Button>
              <Button
                size="sm"
                color="accent"
                variant="solid"
                disabled={disabled || selectedCount === 0 || cardCount === 0}
                onClick={onConfirm}
              >
                {t`Confirm approval`}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
