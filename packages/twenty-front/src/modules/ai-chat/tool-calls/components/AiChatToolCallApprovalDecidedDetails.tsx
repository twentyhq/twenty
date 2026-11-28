import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type ProposeToolCallToolResult,
  type ProposeToolCallToolStatus,
} from 'twenty-shared/ai';
import { type FrontComponentToolCallStatus } from 'twenty-sdk/front-component';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { IconMail } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatApprovalEmailReview } from '@/ai-chat/tool-calls/components/AiChatApprovalEmailReview';
import { AiChatToolCallApprovalCardHeader } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalCardHeader';
import { AiChatToolCallApprovalGenericArguments } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalGenericArguments';
import { AiChatToolCallApprovalRecord } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalRecord';
import { AiChatToolCallApprovalRecordFields } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalRecordFields';
import { StyledAiChatAskCard } from '@/ai-chat/tool-calls/components/StyledAiChatAskCard';
import { StyledAiChatToolCallApprovalCardBody } from '@/ai-chat/tool-calls/components/StyledAiChatToolCallApprovalCardBody';
import { getProposedToolCallLabel } from '@/ai-chat/tool-calls/utils/getProposedToolCallLabel';
import { readEmailDraftFromToolArguments } from '@/ai-chat/tool-calls/utils/readEmailDraftFromToolArguments';

const StyledNote = styled.div<{ isError: boolean }>`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${({ isError }) =>
    isError
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]} 0;
`;

const FRONT_COMPONENT_STATUS_BY_APPROVAL_STATUS: Record<
  ProposeToolCallToolStatus,
  FrontComponentToolCallStatus
> = {
  pending: 'approval-requested',
  running: 'approval-responded',
  approved: 'output-available',
  rejected: 'output-denied',
  failed: 'output-error',
  conflict: 'output-denied',
  skipped: 'output-denied',
};

type AiChatToolCallApprovalDecidedDetailsProps = {
  toolCallId: string;
  result: ProposeToolCallToolResult;
};

export const AiChatToolCallApprovalDecidedDetails = ({
  toolCallId,
  result,
}: AiChatToolCallApprovalDecidedDetailsProps) => {
  const { t } = useLingui();
  const { proposal, status, feedback, error } = result;
  const outcomeError =
    error ??
    (status === 'conflict'
      ? t`The record changed since it was proposed, so nothing was run.`
      : undefined);
  const { template, objectNameSingular, recordId } = proposal;

  const isEmail = template === 'email';
  const hasRecordFields =
    (template === 'recordCreate' || template === 'recordUpdate') &&
    isDefined(objectNameSingular);
  const isDeletedRecord = template === 'recordDelete' && status === 'approved';

  return (
    <StyledAiChatAskCard isPadded>
      <AiChatToolCallApprovalCardHeader
        title={getProposedToolCallLabel(proposal)}
        Icon={isEmail ? IconMail : undefined}
        summary={isEmail ? undefined : proposal.summary}
      />
      <StyledAiChatToolCallApprovalCardBody>
        {isEmail && (
          <AiChatApprovalEmailReview
            draft={readEmailDraftFromToolArguments(proposal.arguments)}
            onDraftChange={() => {}}
            disabled
          />
        )}
        {isDefined(objectNameSingular) &&
          isDefined(recordId) &&
          !isDeletedRecord && (
            <AiChatToolCallApprovalRecord
              objectNameSingular={objectNameSingular}
              recordId={recordId}
              label={t`Record:`}
            />
          )}
        {hasRecordFields && (
          <AiChatToolCallApprovalRecordFields
            objectNameSingular={objectNameSingular}
            values={proposal.arguments}
            readonly
            onChange={() => {}}
          />
        )}
        {!isEmail && !hasRecordFields && template !== 'recordDelete' && (
          <AiChatToolCallApprovalGenericArguments
            toolCallId={toolCallId}
            toolName={proposal.toolName}
            toolArguments={proposal.arguments}
            status={FRONT_COMPONENT_STATUS_BY_APPROVAL_STATUS[status]}
            readonly
            output={isPlainObject(result.output) ? result.output : undefined}
            errorText={error}
          />
        )}
      </StyledAiChatToolCallApprovalCardBody>
      {isNonEmptyString(feedback) && (
        <StyledNote isError={false}>{t`Feedback: ${feedback}`}</StyledNote>
      )}
      {isNonEmptyString(outcomeError) && (
        <StyledNote isError>{outcomeError}</StyledNote>
      )}
    </StyledAiChatAskCard>
  );
};
