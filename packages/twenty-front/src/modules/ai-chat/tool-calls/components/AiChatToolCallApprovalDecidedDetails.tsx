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
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { TextWithChatReferences } from '@/ai-chat/message-content/components/TextWithChatReferences';
import { AiChatApprovalEmailReview } from '@/ai-chat/tool-calls/components/AiChatApprovalEmailReview';
import { AiChatAskDetails } from '@/ai-chat/tool-calls/components/AiChatAskDetails';
import { AiChatToolCallApprovalArgumentsEditor } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalArgumentsEditor';
import { AiChatToolCallApprovalRecord } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalRecord';
import { AiChatToolCallApprovalRecordFields } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalRecordFields';
import { AiChatToolFrontComponent } from '@/ai-chat/tool-calls/components/AiChatToolFrontComponent';
import { StyledAiChatAskCard } from '@/ai-chat/tool-calls/components/StyledAiChatAskCard';
import { useFrontComponentIdByToolName } from '@/ai-chat/tool-calls/hooks/useFrontComponentIdByToolName';
import { getProposedToolCallLabel } from '@/ai-chat/tool-calls/utils/getProposedToolCallLabel';
import { readEmailDraftFromToolArguments } from '@/ai-chat/tool-calls/utils/readEmailDraftFromToolArguments';

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]} 0;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[6]};
  min-width: 0;
`;

const StyledTitle = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSummary = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  overflow-wrap: anywhere;
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledNote = styled.div<{ isError: boolean }>`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${({ isError }) =>
    isError
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow-wrap: anywhere;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
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
  const theme = useTheme();
  const { proposal, status, feedback, error } = result;
  const outcomeError =
    error ??
    (status === 'conflict'
      ? t`The record changed since it was proposed, so nothing was run.`
      : undefined);
  const { template, objectNameSingular, recordId } = proposal;
  const toolFrontComponentId = useFrontComponentIdByToolName().get(
    proposal.toolName,
  );

  const isEmail = template === 'email';
  const hasRecordFields =
    (template === 'recordCreate' || template === 'recordUpdate') &&
    isDefined(objectNameSingular);
  const isDeletedRecord = template === 'recordDelete' && status === 'approved';

  const argumentsEditor = (
    <AiChatToolCallApprovalArgumentsEditor
      defaultArguments={proposal.arguments}
      readonly
      onChange={() => {}}
    />
  );

  const genericContent = isDefined(toolFrontComponentId) ? (
    <AiChatToolFrontComponent
      frontComponentId={toolFrontComponentId}
      toolCall={{
        toolCallId,
        toolName: proposal.toolName,
        status: FRONT_COMPONENT_STATUS_BY_APPROVAL_STATUS[status],
        input: proposal.arguments,
        output: isPlainObject(result.output) ? result.output : undefined,
        errorText: error,
      }}
      unavailableFallback={argumentsEditor}
      errorFallback={argumentsEditor}
    />
  ) : (
    argumentsEditor
  );

  return (
    <AiChatAskDetails>
      <StyledAiChatAskCard>
        <StyledHeader>
          <StyledTitleRow>
            {isEmail && <IconMail size={theme.icon.size.md} />}
            <StyledTitle>{getProposedToolCallLabel(proposal)}</StyledTitle>
          </StyledTitleRow>
          {!isEmail && (
            <StyledSummary>
              <TextWithChatReferences text={proposal.summary} />
            </StyledSummary>
          )}
        </StyledHeader>
        <StyledBody>
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
          {!isEmail &&
            !hasRecordFields &&
            template !== 'recordDelete' &&
            genericContent}
        </StyledBody>
        {isNonEmptyString(feedback) && (
          <StyledNote isError={false}>{t`Feedback: ${feedback}`}</StyledNote>
        )}
        {isNonEmptyString(outcomeError) && (
          <StyledNote isError>{outcomeError}</StyledNote>
        )}
      </StyledAiChatAskCard>
    </AiChatAskDetails>
  );
};
