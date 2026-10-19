import { useLingui } from '@lingui/react/macro';
import { IconTerminal } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { useIsLogConsoleAllowed } from '@/log-console/hooks/useIsLogConsoleAllowed';
import { useOpenLogConsole } from '@/log-console/hooks/useOpenLogConsole';
import { type LogConsoleView } from '@/log-console/types/LogConsoleView';

type LogConsoleViewLogsButtonProps = {
  view: LogConsoleView;
};

export const LogConsoleViewLogsButton = ({
  view,
}: LogConsoleViewLogsButtonProps) => {
  const { t } = useLingui();
  const isLogConsoleAllowed = useIsLogConsoleAllowed();
  const { openLogConsole } = useOpenLogConsole();

  if (!isLogConsoleAllowed) {
    return null;
  }

  return (
    <Button
      startIcon={<IconTerminal />}
      variant="outline"
      size="sm"
      onClick={() => openLogConsole(view)}
    >{t`View logs`}</Button>
  );
};
