import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type FocusEvent, useId, useRef, useState } from 'react';
import {
  type SetuAiActionOperation,
  type SetuAiActionProjection,
  type SetuAiErrorCode,
  type SetuSendEmailActionPayload,
  type SetuUpdateRecordFieldsActionPayload,
} from 'twenty-shared/ai';
import { IconCheck, IconEdit, IconPlayerStop, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { serializeEmailRecipients } from '@/activities/emails/recipients/utils/serializeEmailRecipients';
import { AiActionEmailPreview } from '@/ai/components/AiActionEmailPreview';
import { AiActionRecordChangesPreview } from '@/ai/components/AiActionRecordChangesPreview';
import { StyledAiChatAskCard } from '@/ai/components/AiChatAskStyledComponents';
import { AiChatInteractionFallback } from '@/ai/components/AiChatInteractionFallback';
import { useAiActionOperations } from '@/ai/hooks/useAiActionOperations';
import { useAiActionState } from '@/ai/hooks/useAiActionState';
import { type AiActionEmailDraft } from '@/ai/types/AiActionEmailDraft';
import { formatAiActionFieldValue } from '@/ai/utils/formatAiActionFieldValue';
import { getAiActionErrorMessage } from '@/ai/utils/getAiActionErrorMessage';
import { getAiActionStatusPresentation } from '@/ai/utils/getAiActionStatusPresentation';
import { parseAiActionFieldDraftValue } from '@/ai/utils/parseAiActionFieldDraftValue';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]} 0;
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledContent = styled.div`
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledStatusLine = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledError = styled.p`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  outline: none;
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledActions = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledLoading = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[3]};
`;

type PendingOperation = SetuAiActionOperation | 'save';

const toEmailDraft = (
  payload: SetuSendEmailActionPayload,
): AiActionEmailDraft => ({
  to: payload.to.map((address) => ({ address })),
  cc: payload.cc.map((address) => ({ address })),
  bcc: payload.bcc.map((address) => ({ address })),
  subject: payload.subject,
  body: payload.body,
});

const toRecordDraftValues = (
  payload: SetuUpdateRecordFieldsActionPayload,
): Record<string, string> =>
  Object.fromEntries(
    payload.changes.map((change) => [
      change.fieldName,
      change.after === null || change.after === undefined
        ? ''
        : formatAiActionFieldValue(change.after),
    ]),
  );

type AiChatActionReviewCardContentProps = {
  requestedId: string;
  action: SetuAiActionProjection;
};

const AiChatActionReviewCardContent = ({
  requestedId,
  action,
}: AiChatActionReviewCardContentProps) => {
  const { t } = useLingui();
  const focusId = useId();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const { decide, cancel, revise } = useAiActionOperations(requestedId);
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  // Drafts live apart from the server projection, so polling never wipes an
  // edit in progress and a version conflict keeps what was typed.
  const [emailDraft, setEmailDraft] = useState<AiActionEmailDraft | null>(null);
  const [recordDraftValues, setRecordDraftValues] = useState<Record<
    string,
    string
  > | null>(null);
  const [pendingOperation, setPendingOperation] =
    useState<PendingOperation | null>(null);
  const [operationErrorCode, setOperationErrorCode] = useState<
    SetuAiErrorCode | null | undefined
  >(undefined);

  const isEditing = emailDraft !== null || recordDraftValues !== null;
  const isSubmitting = pendingOperation !== null;
  const canDo = (operation: SetuAiActionOperation) =>
    action.allowedOperations.includes(operation);
  const { label, color, description } = getAiActionStatusPresentation(action);
  const title =
    action.kind === 'send_email'
      ? t`Send one email`
      : t`Update ${action.payload.objectLabel}`;

  const runOperation = async (
    operation: PendingOperation,
    perform: () => ReturnType<typeof decide>,
  ) => {
    setPendingOperation(operation);
    setOperationErrorCode(undefined);

    const result = await perform();

    setPendingOperation(null);

    if (result.isSuccessful) {
      if (operation === 'save') {
        setEmailDraft(null);
        setRecordDraftValues(null);
      }

      return;
    }

    setOperationErrorCode(result.errorCode);
    // Moving focus announces the failure and keeps keyboard users in place.
    requestAnimationFrame(() => errorRef.current?.focus());
  };

  const startEditing = () => {
    if (action.kind === 'send_email') {
      setEmailDraft(toEmailDraft(action.payload));
    } else {
      setRecordDraftValues(toRecordDraftValues(action.payload));
    }
  };

  const discardEdits = () => {
    setEmailDraft(null);
    setRecordDraftValues(null);
    setOperationErrorCode(undefined);
  };

  const saveEdits = () => {
    const edits =
      action.kind === 'send_email' && emailDraft !== null
        ? {
            to: serializeEmailRecipients(emailDraft.to),
            cc: serializeEmailRecipients(emailDraft.cc),
            bcc: serializeEmailRecipients(emailDraft.bcc),
            subject: emailDraft.subject,
            body: emailDraft.body,
          }
        : action.kind === 'update_record_fields' && recordDraftValues !== null
          ? {
              fields: Object.fromEntries(
                action.payload.changes.map((change) => [
                  change.fieldName,
                  parseAiActionFieldDraftValue(
                    recordDraftValues[change.fieldName] ?? '',
                    change.after,
                  ),
                ]),
              ),
            }
          : {};

    void runOperation('save', () => revise(action, edits));
  };

  // Typing in the card must not trigger the page's keyboard shortcuts.
  const handleFieldFocus = (event: FocusEvent) => {
    if (
      !(event.target instanceof HTMLInputElement) &&
      !(event.target instanceof HTMLTextAreaElement)
    ) {
      return;
    }

    pushFocusItemToFocusStack({
      focusId,
      component: { type: FocusComponentType.TEXT_AREA, instanceId: focusId },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleFieldBlur = () => {
    removeFocusItemFromFocusStackById({ focusId });
  };

  return (
    <StyledAiChatAskCard role="group" aria-label={title}>
      <StyledHeader>
        <StyledTitle>{title}</StyledTitle>
        <Tag color={color} variant="soft">
          {`${label} · v${action.revision}`}
        </Tag>
      </StyledHeader>
      <StyledContent onFocus={handleFieldFocus} onBlur={handleFieldBlur}>
        {action.kind === 'send_email' ? (
          <AiActionEmailPreview
            payload={action.payload}
            draft={emailDraft}
            isDisabled={isSubmitting}
            onDraftChange={setEmailDraft}
          />
        ) : (
          <AiActionRecordChangesPreview
            payload={action.payload}
            draftValues={recordDraftValues}
            isDisabled={isSubmitting}
            onDraftValueChange={(fieldName, value) =>
              setRecordDraftValues((draftValues) => ({
                ...draftValues,
                [fieldName]: value,
              }))
            }
          />
        )}
      </StyledContent>
      <StyledStatusLine role="status" aria-live="polite">
        {isEditing
          ? t`Saving creates a new version that needs your review again.`
          : description}
      </StyledStatusLine>
      {operationErrorCode !== undefined && (
        <StyledError ref={errorRef} role="alert" tabIndex={-1}>
          {getAiActionErrorMessage(operationErrorCode)}
        </StyledError>
      )}
      {(isEditing || action.allowedOperations.length > 0) && (
        <StyledActions>
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                disabled={isSubmitting}
                onClick={discardEdits}
              >
                {t`Discard changes`}
              </Button>
              <Button
                size="sm"
                variant="solid"
                color="accent"
                disabled={isSubmitting || !canDo('revise')}
                loading={pendingOperation === 'save'}
                onClick={saveEdits}
              >
                {t`Save new version`}
              </Button>
            </>
          ) : (
            <>
              {canDo('revise') && (
                <Button
                  size="sm"
                  variant="ghost"
                  startIcon={<IconEdit />}
                  disabled={isSubmitting}
                  onClick={startEditing}
                >
                  {t`Edit`}
                </Button>
              )}
              {canDo('cancel') && (
                <Button
                  size="sm"
                  variant="outline"
                  startIcon={<IconPlayerStop />}
                  disabled={isSubmitting}
                  loading={pendingOperation === 'cancel'}
                  onClick={() =>
                    void runOperation('cancel', () => cancel(action))
                  }
                >
                  {t`Cancel`}
                </Button>
              )}
              {canDo('reject') && (
                <Button
                  size="sm"
                  variant="outline"
                  startIcon={<IconX />}
                  disabled={isSubmitting}
                  loading={pendingOperation === 'reject'}
                  onClick={() =>
                    void runOperation('reject', () => decide(action, 'reject'))
                  }
                >
                  {t`Reject`}
                </Button>
              )}
              {canDo('approve') && (
                <Button
                  size="sm"
                  variant="solid"
                  color="accent"
                  startIcon={<IconCheck />}
                  disabled={isSubmitting}
                  loading={pendingOperation === 'approve'}
                  onClick={() =>
                    void runOperation('approve', () =>
                      decide(action, 'approve'),
                    )
                  }
                >
                  {t`Approve & queue`}
                </Button>
              )}
            </>
          )}
        </StyledActions>
      )}
    </StyledAiChatAskCard>
  );
};

type AiChatActionReviewCardProps = {
  actionRequestId: string;
};

// The generic review shell. The server's allowedOperations decide which
// controls exist; every operation is still rechecked by the server.
export const AiChatActionReviewCard = ({
  actionRequestId,
}: AiChatActionReviewCardProps) => {
  const { t } = useLingui();
  const state = useAiActionState(actionRequestId);

  switch (state.status) {
    case 'loading':
      return (
        <StyledAiChatAskCard>
          <StyledLoading role="status">{t`Loading the review…`}</StyledLoading>
        </StyledAiChatAskCard>
      );
    case 'unavailable':
      return (
        <StyledAiChatAskCard>
          <StyledLoading>{t`This action is not available.`}</StyledLoading>
        </StyledAiChatAskCard>
      );
    case 'unsupported-version':
      return <AiChatInteractionFallback />;
    case 'available':
      return (
        <AiChatActionReviewCardContent
          requestedId={actionRequestId}
          action={state.action}
        />
      );
  }
};
