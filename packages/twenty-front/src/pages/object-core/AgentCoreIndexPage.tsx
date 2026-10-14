import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLego } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { CORE_AGENT_TABLE_COLUMNS } from '@/object-core/agents/constants/CoreAgentTableColumns';
import {
  CORE_AGENTS_INITIAL_SORT,
  CORE_AGENTS_TABLE_ID,
  useCoreAgents,
} from '@/object-core/agents/hooks/useCoreAgents';
import { useCreateCoreAgent } from '@/object-core/agents/hooks/useCreateCoreAgent';
import { shouldShowSystemCoreAgentsState } from '@/object-core/agents/states/shouldShowSystemCoreAgentsState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { CoreObjectIndexPageLayout } from '@/object-core/components/CoreObjectIndexPageLayout';
import { CoreObjectSystemFilterChip } from '@/object-core/components/CoreObjectSystemFilterChip';
import { CoreObjectTable } from '@/object-core/components/CoreObjectTable';
import { CoreObjectTableAddNewRow } from '@/object-core/components/CoreObjectTableAddNewRow';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const getCoreAgentItemLink = (agent: CoreAgent) => getCoreAgentLink(agent.id);

export const AgentCoreIndexPage = () => {
  const theme = useTheme();

  const tableId =
    useWorkspaceSurfaceScopedComponentInstanceId(CORE_AGENTS_TABLE_ID);

  const { coreAgents, hasSystemAgents, isInitialLoading, error } =
    useCoreAgents({ tableId });

  const [shouldShowSystemCoreAgents, setShouldShowSystemCoreAgents] =
    useAtomState(shouldShowSystemCoreAgentsState);

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
          {hasSystemAgents && !shouldShowSystemCoreAgents && (
            <CoreObjectSystemFilterChip
              onRemove={() => setShouldShowSystemCoreAgents(true)}
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
      {canCreateCoreAgent && (
        <CoreObjectTableAddNewRow
          label={t`New Agent`}
          onClick={createCoreAgent}
          disabled={isCreatingCoreAgent}
        />
      )}
    </CoreObjectIndexPageLayout>
  );
};
