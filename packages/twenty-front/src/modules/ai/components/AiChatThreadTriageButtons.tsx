import { useLingui } from '@lingui/react/macro';
import { IconArrowBackUp, IconBell, IconCheck, IconZzz } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type AiChatThreadTriageButtonsProps = {
  status: 'open' | 'snoozed' | 'done';
  isPending?: boolean;
  onSnooze: () => void;
  onDone: () => void;
  onReopen: () => void;
};

export const AiChatThreadTriageButtons = ({
  status,
  isPending = false,
  onSnooze,
  onDone,
  onReopen,
}: AiChatThreadTriageButtonsProps) => {
  const { t } = useLingui();

  if (status === 'done') {
    return (
      <Button
        size="sm"
        startIcon={<IconArrowBackUp />}
        disabled={isPending}
        onClick={onReopen}
      >
        {t`Reopen`}
      </Button>
    );
  }

  return (
    <>
      <Button
        size="sm"
        startIcon={<IconZzz />}
        disabled={isPending}
        onClick={onSnooze}
      >
        {status === 'snoozed' ? t`Change` : t`Snooze`}
      </Button>
      <Button
        size="sm"
        startIcon={status === 'snoozed' ? <IconBell /> : <IconCheck />}
        disabled={isPending}
        onClick={status === 'snoozed' ? onReopen : onDone}
      >
        {status === 'snoozed' ? t`Wake now` : t`Done`}
      </Button>
    </>
  );
};
