import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  IconArrowUpRight,
  IconCopy,
  IconLayoutSidebarRightExpand,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

import { LogConsoleListLayout } from '@/log-console/components/LogConsoleListLayout';
import {
  type LogConsoleListTableColumn,
  LogConsoleListTable,
} from '@/log-console/components/LogConsoleListTable';
import { LOG_CONSOLE_CLI_COMMANDS } from '@/log-console/constants/LogConsoleCliCommands';
import { isLogConsoleCliGuideOpenState } from '@/log-console/states/isLogConsoleCliGuideOpenState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

const TWENTY_CLI_DOCUMENTATION_URL = 'https://www.npmjs.com/package/twenty';

type LogConsoleCliCommand = (typeof LOG_CONSOLE_CLI_COMMANDS)[number];

export const LogConsoleCli = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const [searchValue, setSearchValue] = useState('');
  const [isLogConsoleCliGuideOpen, setIsLogConsoleCliGuideOpen] = useAtomState(
    isLogConsoleCliGuideOpenState,
  );

  const normalizedSearchValue = searchValue.toLowerCase();

  const filteredCommands = LOG_CONSOLE_CLI_COMMANDS.filter((cliCommand) =>
    [cliCommand.command, t(cliCommand.description)].some((value) =>
      value.toLowerCase().includes(normalizedSearchValue),
    ),
  );

  const columns: LogConsoleListTableColumn<LogConsoleCliCommand>[] = [
    {
      label: t`Command`,
      width: '2fr',
      renderCell: (cliCommand) => (
        <OverflowingTextWithTooltip text={`twenty ${cliCommand.command}`} />
      ),
    },
    {
      label: t`Description`,
      width: '3fr',
      renderCell: (cliCommand) => (
        <OverflowingTextWithTooltip text={t(cliCommand.description)} />
      ),
    },
  ];

  return (
    <LogConsoleListLayout
      searchPlaceholder={t`Search commands`}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      scrollWrapperInstanceId="log-console-cli"
      actions={
        <>
          <Button
            endIcon={<IconArrowUpRight />}
            size="sm"
            variant="outline"
            onClick={() => openUrlInNewTab(TWENTY_CLI_DOCUMENTATION_URL)}
          >{t`Documentation`}</Button>
          {!isLogConsoleCliGuideOpen && (
            <Button
              startIcon={<IconLayoutSidebarRightExpand />}
              size="sm"
              variant="outline"
              onClick={() => setIsLogConsoleCliGuideOpen(true)}
            >{t`Get started`}</Button>
          )}
        </>
      }
    >
      <LogConsoleListTable
        columns={columns}
        items={filteredCommands}
        getItemId={(cliCommand) => cliCommand.command}
        onItemClick={(cliCommand) =>
          copyToClipboard(
            `npx twenty ${cliCommand.command}`,
            t`Command copied to clipboard`,
          )
        }
        RowActionIcon={IconCopy}
        emptyLabel={t`No commands found`}
      />
    </LogConsoleListLayout>
  );
};
