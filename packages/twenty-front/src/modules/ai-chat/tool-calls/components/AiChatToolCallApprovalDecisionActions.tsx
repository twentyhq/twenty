import { useLingui } from '@lingui/react/macro';
import { type ToolApprovalLabels } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type AiChatToolCallApprovalDecisionActionsProps = {
  proposedToolName: string;
  alternativeToolNames: string[];
  labels: ToolApprovalLabels | undefined;
  pendingToolName: string | null;
  isRejecting: boolean;
  isAnswering: boolean;
  isApproveDisabled: boolean;
  onReject: () => void;
  onApprove: (toolName: string) => void;
  onAlternativeClick: (alternativeToolName: string) => void;
};

export const AiChatToolCallApprovalDecisionActions = ({
  proposedToolName,
  alternativeToolNames,
  labels,
  pendingToolName,
  isRejecting,
  isAnswering,
  isApproveDisabled,
  onReject,
  onApprove,
  onAlternativeClick,
}: AiChatToolCallApprovalDecisionActionsProps) => {
  const { t } = useLingui();

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        startIcon={<IconX />}
        disabled={isAnswering}
        loading={isRejecting}
        onClick={onReject}
      >
        {labels?.reject ?? t`Reject`}
      </Button>
      {alternativeToolNames.map((alternativeToolName) => {
        const alternativeLabel = labels?.alternatives?.[alternativeToolName];

        return (
          <Button
            key={alternativeToolName}
            size="sm"
            variant="outline"
            disabled={isAnswering || isApproveDisabled}
            loading={pendingToolName === alternativeToolName}
            onClick={() => onAlternativeClick(alternativeToolName)}
          >
            {isDefined(alternativeLabel?.confirmLabel)
              ? `${alternativeLabel.label}…`
              : (alternativeLabel?.label ?? alternativeToolName)}
          </Button>
        );
      })}
      <Button
        size="sm"
        variant="solid"
        color="accent"
        startIcon={<IconCheck />}
        disabled={isAnswering || isApproveDisabled}
        loading={pendingToolName === proposedToolName}
        onClick={() => onApprove(proposedToolName)}
      >
        {labels?.approve ?? t`Approve`}
      </Button>
    </>
  );
};
