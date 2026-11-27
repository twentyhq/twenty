import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { ComposerHeader } from '@/activities/components/ComposerHeader';
import { INLINE_EMAIL_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/InlineEmailBodyEditorProfile';
import { EmailRecipientsFields } from '@/activities/emails/recipients/components/EmailRecipientsFields';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { type AiChatApprovalReviewEmailDraft } from '@/ai-chat/tool-calls/types/AiChatApprovalReviewEmailDraft';

const StyledEmail = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  min-width: 0;
  overflow: hidden;
`;

const StyledBody = styled.div`
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]};
`;

type AiChatApprovalEmailReviewProps = {
  draft: AiChatApprovalReviewEmailDraft;
  onDraftChange: (
    update: (
      draft: AiChatApprovalReviewEmailDraft,
    ) => AiChatApprovalReviewEmailDraft,
  ) => void;
  disabled?: boolean;
};

export const AiChatApprovalEmailReview = ({
  draft,
  onDraftChange,
  disabled = false,
}: AiChatApprovalEmailReviewProps) => {
  const { t } = useLingui();
  const updateDraft = (changes: Partial<AiChatApprovalReviewEmailDraft>) => {
    if (disabled) {
      return;
    }

    onDraftChange((currentDraft) => ({ ...currentDraft, ...changes }));
  };

  return (
    <StyledEmail>
      <ComposerHeader>
        <EmailRecipientsFields
          recipientsByFieldId={{ to: draft.to, cc: draft.cc, bcc: draft.bcc }}
          onChange={(update) =>
            onDraftChange((currentDraft) => ({
              ...currentDraft,
              ...update({
                to: currentDraft.to,
                cc: currentDraft.cc,
                bcc: currentDraft.bcc,
              }),
            }))
          }
          readonly={disabled}
        />
        <ComposerFieldRow label={t`Subject`} hasDivider={false}>
          <Input
            variant="plain"
            aria-label={t`Subject`}
            placeholder={t`Subject`}
            value={draft.subject}
            disabled={disabled}
            onChange={(event) => updateDraft({ subject: event.target.value })}
          />
        </ComposerFieldRow>
      </ComposerHeader>
      <StyledBody role="group" aria-label={t`Body`}>
        <FormAdvancedTextFieldInput
          value={draft.body}
          aria-label={t`Body`}
          onChange={(body) => updateDraft({ body })}
          readonly={disabled}
          placeholder={t`Write the email`}
          profile={INLINE_EMAIL_BODY_EDITOR_PROFILE}
        />
      </StyledBody>
    </StyledEmail>
  );
};
