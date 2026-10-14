import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { DOCUMENTATION_PATHS } from 'twenty-shared/constants';
import { isDefined, normalizeUrlOrigin } from 'twenty-shared/utils';
import { CommandBlock } from 'twenty-ui/components/data-display';
import { Section } from 'twenty-ui/components/layout';
import { IconArrowUpRight, IconCopy } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { LogConsoleToolbarLayout } from '@/log-console/components/LogConsoleToolbarLayout';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

const BUILD_APP_COMMANDS = [
  'npx twenty app init my-app',
  'cd my-app',
  'yarn install',
  'npx twenty app apply --create',
  'npx twenty app dev',
];

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSections = styled.div`
  box-sizing: border-box;
  display: grid;
  gap: ${themeCssVariables.spacing[6]};
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  padding: ${themeCssVariables.spacing[3]};
`;

export const LogConsoleCli = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const workspaceUrl = normalizeUrlOrigin(
    isDefined(currentWorkspace?.workspaceUrls)
      ? getWorkspaceUrl(currentWorkspace.workspaceUrls)
      : window.location.origin,
  );

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
    <>
      <LogConsoleToolbarLayout
        actions={
          <Button
            endIcon={<IconArrowUpRight />}
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
        }
      >
        <StyledDescription>
          {t`Work with this workspace from your terminal with npx twenty.`}
        </StyledDescription>
      </LogConsoleToolbarLayout>
      <ScrollWrapper componentInstanceId="log-console-cli">
        <StyledSections>
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
          </Section.Root>
        </StyledSections>
      </ScrollWrapper>
    </>
  );
};
