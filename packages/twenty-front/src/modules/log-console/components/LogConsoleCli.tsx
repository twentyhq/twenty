import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { CommandBlock } from 'twenty-ui/components/data-display';
import { Section } from 'twenty-ui/components/layout';
import { IconArrowUpRight, IconCopy } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { LogConsolePageContainer } from '@/log-console/components/LogConsolePageContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

const TWENTY_CLI_DOCUMENTATION_URL = 'https://www.npmjs.com/package/twenty';

const BUILD_APP_COMMANDS = [
  'npx twenty app init my-app',
  'cd my-app',
  'yarn install',
  'npx twenty app apply --create',
  'npx twenty app dev',
];

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const LogConsoleCli = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const workspaceUrl = (
    isDefined(currentWorkspace?.workspaceUrls)
      ? getWorkspaceUrl(currentWorkspace.workspaceUrls)
      : window.location.origin
  ).replace(/\/$/, '');

  const getStartedCommands = [
    `npx twenty auth login --url ${workspaceUrl} --use`,
    'npx twenty metadata object list',
    'npx twenty data list companies --limit 5',
  ];

  const renderCommandBlock = (commands: string[]) => (
    <CommandBlock
      commands={commands}
      actions={
        <Button
          onClick={() =>
            copyToClipboard(
              commands.join('\n'),
              t`Commands copied to clipboard`,
            )
          }
          aria-label={t`Copy commands`}
          startIcon={<IconCopy />}
        />
      }
    />
  );

  return (
    <LogConsolePageContainer scrollWrapperInstanceId="log-console-cli">
      <Section.Root>
        <Section.Header
          title={t`Get started`}
          description={t`Sign in to this workspace from your terminal, then inspect metadata, query records and send API requests. Requires Node.js 24.5 or later.`}
        />
        {renderCommandBlock(getStartedCommands)}
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Build an app`}
          description={t`Scaffold an app, register it in this workspace and sync your changes as you code.`}
        />
        {renderCommandBlock(BUILD_APP_COMMANDS)}
        <StyledButtonContainer>
          <Button
            startIcon={<IconArrowUpRight />}
            size="sm"
            variant="outline"
            onClick={() => openUrlInNewTab(TWENTY_CLI_DOCUMENTATION_URL)}
          >{t`Read documentation`}</Button>
        </StyledButtonContainer>
      </Section.Root>
    </LogConsolePageContainer>
  );
};
