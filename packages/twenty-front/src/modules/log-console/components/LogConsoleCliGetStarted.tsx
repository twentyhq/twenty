import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconCopy, IconTerminal } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { LogConsoleDetailPanelLayout } from '@/log-console/components/LogConsoleDetailPanelLayout';
import { isLogConsoleCliGuideOpenState } from '@/log-console/states/isLogConsoleCliGuideOpenState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

export const LogConsoleCliGetStarted = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { copyToClipboard } = useCopyToClipboard();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const setIsLogConsoleCliGuideOpen = useSetAtomState(
    isLogConsoleCliGuideOpenState,
  );

  const workspaceUrl = (
    isDefined(currentWorkspace?.workspaceUrls)
      ? getWorkspaceUrl(currentWorkspace.workspaceUrls)
      : window.location.origin
  ).replace(/\/$/, '');

  const steps = [
    {
      title: t`1. Sign in`,
      description: t`Opens your browser and saves this workspace as the default remote. Requires Node.js 24.5 or later.`,
      command: `npx twenty auth login --url ${workspaceUrl} --use`,
    },
    {
      title: t`2. Explore your workspace`,
      description: t`Read records, inspect the data model or send raw API requests.`,
      command: 'npx twenty data list companies --limit 5',
    },
    {
      title: t`3. Build an app`,
      description: t`Scaffold an app, then run app dev inside it to sync changes as you code.`,
      command: 'npx twenty app init my-app',
    },
  ];

  return (
    <LogConsoleDetailPanelLayout
      title={t`Get started`}
      icon={
        <IconTerminal size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      }
      onClose={() => setIsLogConsoleCliGuideOpen(false)}
    >
      {steps.map((step, stepIndex) => (
        <Section.Root key={step.command}>
          <Section.Header title={step.title} description={step.description} />
          <SettingsTextInput
            instanceId={`log-console-cli-step-${stepIndex}`}
            value={step.command}
            RightIcon={IconCopy}
            onRightIconClick={() =>
              copyToClipboard(step.command, t`Command copied to clipboard`)
            }
            fullWidth
          />
        </Section.Root>
      ))}
    </LogConsoleDetailPanelLayout>
  );
};
