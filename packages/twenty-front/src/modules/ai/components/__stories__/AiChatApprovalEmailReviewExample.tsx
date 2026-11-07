import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatApprovalEmailConfirmation } from '@/ai/components/AiChatApprovalEmailConfirmation';
import { AiChatApprovalEmailReviewDeck } from '@/ai/components/AiChatApprovalEmailReviewDeck';
import { AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES } from '@/ai/components/__stories__/aiChatApprovalEmailReviewFixtures';
import { type AiChatApprovalEmailReviewSnapshot } from '@/ai/components/__stories__/AiChatApprovalEmailReviewSnapshot';
import { type AiChatApprovalReviewEmail } from '@/ai/types/AiChatApprovalReviewEmail';
import { type AiChatApprovalReviewEmailDraft } from '@/ai/types/AiChatApprovalReviewEmailDraft';

const StyledExample = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
`;

type AiChatApprovalEmailReviewExampleProps = {
  initialEmails?: readonly AiChatApprovalReviewEmail[];
  initialActiveIndex?: number;
  disabled?: boolean;
  onApprove: (snapshot: AiChatApprovalEmailReviewSnapshot) => void;
  onSkip: (emailId: string) => void;
};

export const AiChatApprovalEmailReviewExample = ({
  initialEmails = AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES,
  initialActiveIndex = 0,
  disabled = false,
  onApprove,
  onSkip,
}: AiChatApprovalEmailReviewExampleProps) => {
  const [emails, setEmails] = useState(() => structuredClone(initialEmails));
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [confirmation, setConfirmation] =
    useState<AiChatApprovalEmailReviewSnapshot | null>(null);

  const handleDraftChange = ({
    emailId,
    draft,
  }: {
    emailId: string;
    draft: AiChatApprovalReviewEmailDraft;
  }) => {
    setEmails((currentEmails) =>
      currentEmails.map((email) =>
        email.id === emailId ? { ...email, draft } : email,
      ),
    );
  };

  const handleRequestApproval = (emailIds: string[]) => {
    const selectedEmails = emails.filter(
      (email) => email.status === 'pending' && emailIds.includes(email.id),
    );

    if (!isNonEmptyArray(selectedEmails)) {
      return;
    }

    setConfirmation({ emails: structuredClone(selectedEmails) });
  };

  const handleConfirm = () => {
    if (!isDefined(confirmation)) {
      return;
    }

    onApprove(confirmation);
    setEmails((currentEmails) =>
      currentEmails.map<AiChatApprovalReviewEmail>((email) =>
        confirmation.emails.some(
          (selectedEmail) => selectedEmail.id === email.id,
        )
          ? {
              ...email,
              status: 'success',
              outcomeMessage: 'Fixture approval completed.',
            }
          : email,
      ),
    );
    setConfirmation(null);
  };

  const handleSkip = (emailId: string) => {
    setEmails((currentEmails) =>
      currentEmails.map<AiChatApprovalReviewEmail>((email) =>
        email.id === emailId
          ? {
              ...email,
              status: 'skipped',
              outcomeMessage: 'Fixture email was skipped.',
            }
          : email,
      ),
    );
    onSkip(emailId);
  };

  return (
    <StyledExample>
      <AiChatApprovalEmailReviewDeck
        emails={emails}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        onDraftChange={handleDraftChange}
        onRequestApproval={handleRequestApproval}
        onSkip={handleSkip}
        disabled={disabled || isDefined(confirmation)}
      />
      {isDefined(confirmation) && (
        <AiChatApprovalEmailConfirmation
          emails={confirmation.emails}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmation(null)}
        />
      )}
    </StyledExample>
  );
};
