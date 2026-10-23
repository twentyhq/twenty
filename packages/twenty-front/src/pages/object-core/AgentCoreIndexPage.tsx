import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLego } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { CoreAgentsFilterButton } from '@/object-core/agents/components/CoreAgentsFilterButton';
import { CORE_AGENT_TABLE_COLUMNS } from '@/object-core/agents/constants/CoreAgentTableColumns';
import { CORE_AGENT_FILTER_FIELDS } from '@/object-core/agents/constants/CoreAgentFilterFields';
import { CORE_AGENTS_DEFAULT_FILTER_SETTINGS } from '@/object-core/agents/constants/CoreAgentsDefaultFilterSettings';
import {
  CORE_AGENTS_INITIAL_SORT,
  CORE_AGENTS_TABLE_ID,
  useCoreAgents,
} from '@/object-core/agents/hooks/useCoreAgents';
import { useCreateCoreAgent } from '@/object-core/agents/hooks/useCreateCoreAgent';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { CoreObjectIndexPageLayout } from '@/object-core/components/CoreObjectIndexPageLayout';
import { CoreObjectTable } from '@/object-core/components/CoreObjectTable';
import { CoreObjectTableAddNewRow } from '@/object-core/components/CoreObjectTableAddNewRow';
import { hasAppliedCoreObjectFilters } from '@/object-core/filters/utils/hasAppliedCoreObjectFilters';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const getCoreAgentItemLink = (agent: CoreAgent) => getCoreAgentLink(agent.id);

export const AgentCoreIndexPage = () => {
  const theme = useTheme();

  const tableId =
    useWorkspaceSurfaceScopedComponentInstanceId(CORE_AGENTS_TABLE_ID);

  const { coreAgents, isInitialLoading, error } = useCoreAgents({ tableId });

  const coreAgentsFilterSettings = useAtomStateValue(
    coreAgentsFilterSettingsState,
  );

  const { createCoreAgent, canCreateCoreAgent, isCreatingCoreAgent } =
    useCreateCoreAgent();

  const hasError = isDefined(error);

  const isEmpty = !isInitialLoading && !hasError && coreAgents.length === 0;

  const hasAppliedFilters = hasAppliedCoreObjectFilters({
    filterSettings: coreAgentsFilterSettings,
    defaultFilterSettings: CORE_AGENTS_DEFAULT_FILTER_SETTINGS,
    filterFields: CORE_AGENT_FILTER_FIELDS,
  });

  return (
    <CoreObjectIndexPageLayout
      labelPlural={t`Agents`}
      icon={
        <IconLego size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      }
      actionButton={
        <>
          <CoreAgentsFilterButton isFilterActive={hasAppliedFilters} />
          <SidePanelToggleButton />
        </>
      }
      isInitialLoading={isInitialLoading}
      hasError={hasError}
      isEmpty={isEmpty}
      emptyState={{
        hasAppliedFilters,
        title: hasAppliedFilters ? t`No Agents found` : t`Add your first Agent`,
        subTitle: hasAppliedFilters
          ? t`No Agents match your filters. Try removing some of them.`
          : t`Create an Agent to automate your work.`,
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
