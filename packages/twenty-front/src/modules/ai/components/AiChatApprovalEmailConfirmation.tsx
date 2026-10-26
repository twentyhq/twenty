import { Plural } from '@lingui/react/macro';

import { AiChatApprovalConfirmation } from '@/ai/components/AiChatApprovalConfirmation';
import { type AiChatApprovalReviewEmail } from '@/ai/types/AiChatApprovalReviewEmail';

type AiChatApprovalEmailConfirmationProps = {
  emails: readonly AiChatApprovalReviewEmail[];
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
};

export const AiChatApprovalEmailConfirmation = ({
  emails,
  onConfirm,
  onCancel,
  disabled = false,
}: AiChatApprovalEmailConfirmationProps) => (
  <AiChatApprovalConfirmation
    cards={emails.map((email) => ({
      id: email.id,
      title: email.draft.subject,
      selectedCount: 1,
      skippedCount: 0,
    }))}
    selectionSummary={
      <Plural
        value={emails.length}
        one="# email selected · 0 emails skipped"
        other="# emails selected · 0 emails skipped"
      />
    }
    onConfirm={onConfirm}
    onCancel={onCancel}
    disabled={disabled}
  />
);
