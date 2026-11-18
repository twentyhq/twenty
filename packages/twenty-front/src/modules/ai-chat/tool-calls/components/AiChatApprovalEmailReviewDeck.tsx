import { Plural, useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { IconMail } from 'twenty-ui/icon';

import { AiChatApprovalEmailReview } from '@/ai-chat/tool-calls/components/AiChatApprovalEmailReview';
import { AiChatApprovalReviewDeck } from '@/ai-chat/tool-calls/components/AiChatApprovalReviewDeck';
import { type AiChatApprovalReviewCard } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewCard';
import { type AiChatApprovalReviewEmail } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewEmail';
import { type AiChatApprovalReviewEmailDraft } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewEmailDraft';

const EMAIL_REVIEW_ICON_SIZE = 16;

type AiChatApprovalEmailReviewDeckProps = {
  emails: readonly AiChatApprovalReviewEmail[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onDraftChange: (change: {
    emailId: string;
    update: (
      draft: AiChatApprovalReviewEmailDraft,
    ) => AiChatApprovalReviewEmailDraft;
  }) => void;
  onRequestApproval: (emailIds: string[]) => void;
  onSkip: (emailId: string) => void;
  disabled?: boolean;
};

export const AiChatApprovalEmailReviewDeck = ({
  emails,
  activeIndex,
  onActiveIndexChange,
  onDraftChange,
  onRequestApproval,
  onSkip,
  disabled = false,
}: AiChatApprovalEmailReviewDeckProps) => {
  const { t } = useLingui();
  const cards: AiChatApprovalReviewCard[] = emails.map((email, index) => {
    const remainingDraftCount = emails
      .slice(index + 1)
      .filter((draft) => draft.status === 'pending').length;

    return {
      id: email.id,
      title: t`Send email`,
      icon: <IconMail size={EMAIL_REVIEW_ICON_SIZE} />,
      approveLabel: t`Send`,
      denyLabel: t`Skip`,
      selectedCount: 1,
      isApprovalDisabled: !isNonEmptyArray(email.draft.to),
      skippedCount: 0,
      status: email.status,
      outcomeMessage: email.outcomeMessage,
      progress: email.progress,
      hint: isNonEmptyArray(email.draft.to) ? (
        <Plural
          value={remainingDraftCount}
          _0="No more drafts after this one"
          one="# more draft after this one"
          other="# more drafts after this one"
        />
      ) : (
        t`Add a recipient before sending`
      ),
      content: (
        <AiChatApprovalEmailReview
          key={email.id}
          draft={email.draft}
          disabled={disabled || email.status !== 'pending'}
          onDraftChange={(update) =>
            onDraftChange({ emailId: email.id, update })
          }
        />
      ),
    };
  });

  return (
    <AiChatApprovalReviewDeck
      cards={cards}
      activeIndex={activeIndex}
      onActiveIndexChange={onActiveIndexChange}
      onRequestApproval={onRequestApproval}
      onDeny={onSkip}
      disabled={disabled}
      getApproveAllLabel={(pendingEmailCount) =>
        t`Send all ${pendingEmailCount}`
      }
    />
  );
};
