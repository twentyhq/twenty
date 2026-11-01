import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ProposedToolCall } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { AiChatFrontComponentPreviewContent } from '@/ai/components/AiChatFrontComponentPreviewContent';
import { AiChatToolCallApprovalCardLayout } from '@/ai/components/internal/AiChatToolCallApprovalCardLayout';
import { useAiChatFrontComponentPreview } from '@/ai/hooks/useAiChatFrontComponentPreview';
import { useAnswerToolCallApproval } from '@/ai/hooks/useAnswerToolCallApproval';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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
  const isEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_COMPONENT_BUILDER_ENABLED,
  );
  const draftId = isNonEmptyString(proposal.arguments.draftId)
    ? proposal.arguments.draftId
    : '';
  const previewState = useAiChatFrontComponentPreview(draftId);
  const { pendingResponse, isAnswering, approve, reject } = approval;
  const canLoadPreview = isEnabled && isNonEmptyString(draftId);
  const canApprove =
    canLoadPreview &&
    previewState.preview?.isCurrent === true &&
    !isDefined(previewState.error);

  return (
    <AiChatToolCallApprovalCardLayout
      label={proposal.toolLabel}
      summary={proposal.summary}
      approval={approval}
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
          previewState={previewState}
        />
      ) : (
        <span role="alert">{t`Could not load preview.`}</span>
      )}
    </AiChatToolCallApprovalCardLayout>
  );
};
