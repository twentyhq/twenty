import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Button, Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { INLINE_EMAIL_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/InlineEmailBodyEditorProfile';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { AiChatEmailRecipientsRow } from '@/ai/components/internal/AiChatEmailRecipientsRow';
import { type AiChatApprovalReviewEmailDraft } from '@/ai/types/AiChatApprovalReviewEmailDraft';

const StyledEmail = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  min-width: 0;
`;

const StyledBody = styled.div`
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

type AiChatApprovalEmailReviewProps = {
  draft: AiChatApprovalReviewEmailDraft;
  onDraftChange: (draft: AiChatApprovalReviewEmailDraft) => void;
  disabled?: boolean;
};

export const AiChatApprovalEmailReview = ({
  draft,
  onDraftChange,
  disabled = false,
}: AiChatApprovalEmailReviewProps) => {
  const { t } = useLingui();
  const isCcBccShown =
    draft.isCcBccExpanded ||
    isNonEmptyArray(draft.cc) ||
    isNonEmptyArray(draft.bcc);

  const updateDraft = (changes: Partial<AiChatApprovalReviewEmailDraft>) => {
    if (disabled) {
      return;
    }

    onDraftChange({ ...draft, ...changes });
  };

  return (
    <StyledEmail>
      <AiChatEmailRecipientsRow
        label={t`To`}
        isLabelVisible={false}
        recipients={draft.to}
        disabled={disabled}
        onChange={(to) => updateDraft({ to })}
        trailing={
          !isCcBccShown && (
            <Button
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={() => updateDraft({ isCcBccExpanded: true })}
            >
              {t`Cc/Bcc`}
            </Button>
          )
        }
      />
      {isCcBccShown && (
        <>
          <AiChatEmailRecipientsRow
            label={t`Cc`}
            recipients={draft.cc}
            disabled={disabled}
            onChange={(cc) => updateDraft({ cc })}
          />
          <AiChatEmailRecipientsRow
            label={t`Bcc`}
            recipients={draft.bcc}
            disabled={disabled}
            onChange={(bcc) => updateDraft({ bcc })}
          />
        </>
      )}
      <ComposerFieldRow label={t`Subject`} isLabelVisible={false}>
        <Input
          variant="plain"
          aria-label={t`Subject`}
          placeholder={t`Subject`}
          value={draft.subject}
          disabled={disabled}
          onChange={(event) => updateDraft({ subject: event.target.value })}
        />
      </ComposerFieldRow>
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
