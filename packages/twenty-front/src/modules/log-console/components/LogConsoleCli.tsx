import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { DOCUMENTATION_PATHS } from 'twenty-shared/constants';
import {
  IconArrowUpRight,
  IconCopy,
  IconLayoutSidebarRightExpand,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { LogConsoleListLayout } from '@/log-console/components/LogConsoleListLayout';
import {
  type LogConsoleListTableColumn,
  LogConsoleListTable,
} from '@/log-console/components/LogConsoleListTable';
import { LOG_CONSOLE_CLI_COMMANDS } from '@/log-console/constants/LogConsoleCliCommands';
import { isLogConsoleCliGuideOpenState } from '@/log-console/states/isLogConsoleCliGuideOpenState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

type LogConsoleCliCommand = (typeof LOG_CONSOLE_CLI_COMMANDS)[number];

export const LogConsoleCli = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const [searchValue, setSearchValue] = useState('');
  const [isLogConsoleCliGuideOpen, setIsLogConsoleCliGuideOpen] = useAtomState(
    isLogConsoleCliGuideOpenState,
  );

  const filteredCommands = filterBySearchQuery({
    items: LOG_CONSOLE_CLI_COMMANDS,
    searchQuery: searchValue,
    getSearchableValues: (cliCommand) => [
      cliCommand.command,
      t(cliCommand.description),
    ],
  });

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
            onClick={() =>
              openUrlInNewTab(
                getDocumentationUrl({
                  locale: currentWorkspaceMember?.locale,
                  path: DOCUMENTATION_PATHS.DEVELOPERS_EXTEND_APPS_OPERATIONS_CLI,
                }),
              )
            }
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
