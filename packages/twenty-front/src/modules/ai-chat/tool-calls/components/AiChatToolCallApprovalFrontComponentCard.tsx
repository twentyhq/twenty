import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ProposedToolCall } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { AiChatFrontComponentPreviewContent } from '@/ai-chat/tool-calls/components/AiChatFrontComponentPreviewContent';
import { AiChatToolCallApprovalCardLayout } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalCardLayout';
import { useAiChatFrontComponentPreview } from '@/ai-chat/tool-calls/hooks/useAiChatFrontComponentPreview';
import { useAnswerToolCallApproval } from '@/ai-chat/tool-calls/hooks/useAnswerToolCallApproval';

type AiChatToolCallApprovalFrontComponentCardProps = {
  toolCallId: string;
  proposal: ProposedToolCall;
  isActive: boolean;
};

export const AiChatToolCallApprovalFrontComponentCard = ({
  toolCallId,
  proposal,
  isActive,
}: AiChatToolCallApprovalFrontComponentCardProps) => {
  const approval = useAnswerToolCallApproval({ toolCallId, proposal });

  return isActive ? (
    <AiChatToolCallApprovalFrontComponentContent
      proposal={proposal}
      approval={approval}
    />
  ) : null;
};

type AiChatToolCallApprovalFrontComponentContentProps = {
  proposal: ProposedToolCall;
  approval: ReturnType<typeof useAnswerToolCallApproval>;
};

const AiChatToolCallApprovalFrontComponentContent = ({
  proposal,
  approval,
}: AiChatToolCallApprovalFrontComponentContentProps) => {
  const { t } = useLingui();
  const draftId = isNonEmptyString(proposal.arguments.draftId)
    ? proposal.arguments.draftId
    : '';
  const {
    preview,
    error,
    isRendered,
    loadPreview,
    reportPreviewError,
    reportPreviewRendered,
  } = useAiChatFrontComponentPreview(draftId);
  const { pendingResponse, isAnswering, approve, reject } = approval;
  const canLoadPreview = isNonEmptyString(draftId);
  const canApprove =
    canLoadPreview && preview?.isCurrent && isRendered && !isDefined(error);

  return (
    <AiChatToolCallApprovalCardLayout
      title={proposal.toolLabel}
      summary={proposal.summary}
      actions={
        <>
          <Button
            size="sm"
            variant="ghost"
            startIcon={<IconX />}
            disabled={isAnswering}
            loading={pendingResponse?.decision === 'reject'}
            onClick={reject}
          >
            {t`Reject`}
          </Button>
          <Button
            size="sm"
            variant="solid"
            color="accent"
            startIcon={<IconCheck />}
            disabled={isAnswering || !canApprove}
            loading={pendingResponse?.decision === 'approve'}
            onClick={() => approve({ arguments: proposal.arguments })}
          >
            {t`Approve`}
          </Button>
        </>
      }
    >
      {canLoadPreview ? (
        <AiChatFrontComponentPreviewContent
          key={draftId}
          draftId={draftId}
          preview={preview}
          error={error}
          isRendered={isRendered}
          loadPreview={loadPreview}
          reportPreviewError={reportPreviewError}
          reportPreviewRendered={reportPreviewRendered}
        />
      ) : (
        <span role="alert">{t`Could not load preview.`}</span>
      )}
    </AiChatToolCallApprovalCardLayout>
  );
};
