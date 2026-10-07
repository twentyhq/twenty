import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLego, IconPlus } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';

import { CORE_AGENT_TABLE_COLUMNS } from '@/object-core/agents/constants/CoreAgentTableColumns';
import {
  CORE_AGENTS_INITIAL_SORT,
  CORE_AGENTS_TABLE_ID,
  useCoreAgents,
} from '@/object-core/agents/hooks/useCoreAgents';
import { useCreateCoreAgent } from '@/object-core/agents/hooks/useCreateCoreAgent';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { CoreObjectIndexPageLayout } from '@/object-core/components/CoreObjectIndexPageLayout';
import { CoreObjectTable } from '@/object-core/components/CoreObjectTable';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';

const getCoreAgentItemLink = (agent: CoreAgent) => getCoreAgentLink(agent.id);

export const AgentCoreIndexPage = () => {
  const theme = useTheme();

  const tableId =
    useWorkspaceSurfaceScopedComponentInstanceId(CORE_AGENTS_TABLE_ID);

  const { coreAgents, isInitialLoading, error } = useCoreAgents({ tableId });

  const { createCoreAgent, canCreateCoreAgent, isCreatingCoreAgent } =
    useCreateCoreAgent();

  const hasError = isDefined(error);

  const isEmpty = !isInitialLoading && !hasError && coreAgents.length === 0;

  return (
    <CoreObjectIndexPageLayout
      labelPlural={t`Agents`}
      icon={
        <IconLego size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      }
      actionButton={
        <>
          {canCreateCoreAgent && (
            <CommandMenuButton
              command={{
                key: 'create-core-agent',
                label: t`Create Agent`,
                shortLabel: t`Create`,
                Icon: IconPlus,
                isPrimaryCTA: true,
              }}
              onClick={createCoreAgent}
              disabled={isCreatingCoreAgent}
            />
          )}
          <SidePanelToggleButton />
        </>
      }
      isInitialLoading={isInitialLoading}
      hasError={hasError}
      isEmpty={isEmpty}
      emptyState={{
        title: t`Add your first Agent`,
        subTitle: t`Create an Agent to automate your work.`,
        buttonTitle: t`Add an Agent`,
        onButtonClick: canCreateCoreAgent ? createCoreAgent : undefined,
      }}
    >
      <CoreObjectTable
        tableId={tableId}
        columns={CORE_AGENT_TABLE_COLUMNS}
        items={coreAgents}
        getItemKey={(agent) => agent.id}
        getItemLink={getCoreAgentItemLink}
        initialSort={CORE_AGENTS_INITIAL_SORT}
      />
    </CoreObjectIndexPageLayout>
  );
};
