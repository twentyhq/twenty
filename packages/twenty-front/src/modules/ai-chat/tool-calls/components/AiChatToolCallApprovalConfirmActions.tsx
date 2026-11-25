import { useLingui } from '@lingui/react/macro';
import { IconCheck } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type AiChatToolCallApprovalConfirmActionsProps = {
  confirmLabel: string | undefined;
  isAnswering: boolean;
  isConfirmDisabled: boolean;
  isConfirming: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

export const AiChatToolCallApprovalConfirmActions = ({
  confirmLabel,
  isAnswering,
  isConfirmDisabled,
  isConfirming,
  onBack,
  onConfirm,
}: AiChatToolCallApprovalConfirmActionsProps) => {
  const { t } = useLingui();

  return (
    <>
      <Button size="sm" variant="ghost" disabled={isAnswering} onClick={onBack}>
        {t`Back`}
      </Button>
      <Button
        size="sm"
        variant="solid"
        color="accent"
        startIcon={<IconCheck />}
        disabled={isAnswering || isConfirmDisabled}
        loading={isConfirming}
        onClick={onConfirm}
      >
        {confirmLabel ?? t`Approve`}
      </Button>
    </>
  );
};
