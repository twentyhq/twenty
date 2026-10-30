import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import TextareaAutosize from 'react-textarea-autosize';
import { type SetuSendEmailActionPayload } from 'twenty-shared/ai';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatEmailRecipientsRow } from '@/ai/components/internal/AiChatEmailRecipientsRow';
import { type AiActionEmailDraft } from '@/ai/types/AiActionEmailDraft';

const StyledRows = styled.dl`
  display: grid;
  gap: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
  grid-template-columns: minmax(56px, max-content) 1fr;
  margin: 0;
`;

const StyledLabel = styled.dt`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledValue = styled.dd`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
`;

const StyledBody = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  margin-top: ${themeCssVariables.spacing[2]};
  overflow-wrap: anywhere;
  padding-top: ${themeCssVariables.spacing[2]};
  white-space: pre-wrap;
`;

const StyledEditFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSubjectInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  outline: none;
  padding: ${themeCssVariables.spacing[1]} 0;
`;

const StyledBodyTextarea = styled(TextareaAutosize)`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  outline: none;
  padding: ${themeCssVariables.spacing[1]} 0;
  resize: none;
`;

type AiActionEmailPreviewProps = {
  payload: SetuSendEmailActionPayload;
  draft: AiActionEmailDraft | null;
  isDisabled: boolean;
  onDraftChange: (draft: AiActionEmailDraft) => void;
};

// Shows the canonical message exactly as it will be sent: plain text, the
// frozen sender account, and every recipient line that has addresses.
export const AiActionEmailPreview = ({
  payload,
  draft,
  isDisabled,
  onDraftChange,
}: AiActionEmailPreviewProps) => {
  const { t } = useLingui();

  if (draft !== null) {
    return (
      <StyledEditFields>
        <StyledRows>
          <StyledLabel>{t`From`}</StyledLabel>
          <StyledValue>{payload.senderHandle}</StyledValue>
        </StyledRows>
        <AiChatEmailRecipientsRow
          label={t`To`}
          recipients={draft.to}
          disabled={isDisabled}
          onChange={(to) => onDraftChange({ ...draft, to })}
        />
        <AiChatEmailRecipientsRow
          label={t`Cc`}
          recipients={draft.cc}
          disabled={isDisabled}
          onChange={(cc) => onDraftChange({ ...draft, cc })}
        />
        <AiChatEmailRecipientsRow
          label={t`Bcc`}
          recipients={draft.bcc}
          disabled={isDisabled}
          onChange={(bcc) => onDraftChange({ ...draft, bcc })}
        />
        <StyledSubjectInput
          aria-label={t`Subject`}
          placeholder={t`Subject`}
          value={draft.subject}
          disabled={isDisabled}
          onChange={(event) =>
            onDraftChange({ ...draft, subject: event.target.value })
          }
        />
        <StyledBodyTextarea
          aria-label={t`Message`}
          minRows={4}
          maxRows={16}
          value={draft.body}
          disabled={isDisabled}
          onChange={(event) =>
            onDraftChange({ ...draft, body: event.target.value })
          }
        />
      </StyledEditFields>
    );
  }

  return (
    <div>
      <StyledRows>
        <StyledLabel>{t`From`}</StyledLabel>
        <StyledValue>{payload.senderHandle}</StyledValue>
        <StyledLabel>{t`To`}</StyledLabel>
        <StyledValue>{payload.to.join(', ')}</StyledValue>
        {payload.cc.length > 0 && (
          <>
            <StyledLabel>{t`Cc`}</StyledLabel>
            <StyledValue>{payload.cc.join(', ')}</StyledValue>
          </>
        )}
        {payload.bcc.length > 0 && (
          <>
            <StyledLabel>{t`Bcc`}</StyledLabel>
            <StyledValue>{payload.bcc.join(', ')}</StyledValue>
          </>
        )}
        <StyledLabel>{t`Subject`}</StyledLabel>
        <StyledValue>{payload.subject}</StyledValue>
      </StyledRows>
      <StyledBody>{payload.body}</StyledBody>
    </div>
  );
};
