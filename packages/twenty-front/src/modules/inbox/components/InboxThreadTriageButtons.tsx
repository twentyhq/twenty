import { useLingui } from '@lingui/react/macro';
import { IconButton } from 'twenty-ui/components/input';
import { IconArrowBackUp, IconBell, IconCheck, IconZzz } from 'twenty-ui/icon';

type InboxThreadTriageButtonsProps = {
  status: 'open' | 'snoozed' | 'done';
  isPending?: boolean;
  onSnooze: () => void;
  onDone: () => void;
  onReopen: () => void;
};

export const InboxThreadTriageButtons = ({
  status,
  isPending = false,
  onSnooze,
  onDone,
  onReopen,
}: InboxThreadTriageButtonsProps) => {
  const { t } = useLingui();

  if (status === 'done') {
    return (
      <IconButton
        size="sm"
        tooltip={t`Reopen`}
        aria-label={t`Reopen`}
        disabled={isPending}
        onClick={onReopen}
      >
        <IconArrowBackUp />
      </IconButton>
    );
  }

  const snoozeLabel = status === 'snoozed' ? t`Change` : t`Snooze`;
  const doneLabel = status === 'snoozed' ? t`Wake now` : t`Done`;

  return (
    <>
      <IconButton
        size="sm"
        tooltip={snoozeLabel}
        aria-label={snoozeLabel}
        disabled={isPending}
        onClick={onSnooze}
      >
        <IconZzz />
      </IconButton>
      <IconButton
        size="sm"
        tooltip={doneLabel}
        aria-label={doneLabel}
        disabled={isPending}
        onClick={status === 'snoozed' ? onReopen : onDone}
      >
        {status === 'snoozed' ? <IconBell /> : <IconCheck />}
      </IconButton>
    </>
  );
};
