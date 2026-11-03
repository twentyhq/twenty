import { CoreAgentsIcon } from '@/object-core/agents/components/CoreAgentsIcon';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { CoreAgentMetadataEventsEffect } from '@/object-core/agents/components/CoreAgentMetadataEventsEffect';
import { CoreAgentsDeleteButton } from '@/object-core/agents/components/CoreAgentsDeleteButton';
import { CoreAgentsSelectionCleanupEffect } from '@/object-core/agents/components/CoreAgentsSelectionCleanupEffect';
import { useCoreAgentsSelection } from '@/object-core/agents/hooks/useCoreAgentsSelection';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { CoreAgentsFilterButton } from '@/object-core/agents/components/CoreAgentsFilterButton';
import { CORE_AGENTS_CREATE_COMMAND_ID } from '@/object-core/agents/constants/CoreAgentsCreateCommandId';
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

const getCoreAgentItemLink = (agent: Pick<CoreAgent, 'id'>) =>
  getCoreAgentLink(agent.id);

export const CoreAgentsIndex = () => {
  const theme = useTheme();

  const tableId =
    useWorkspaceSurfaceScopedComponentInstanceId(CORE_AGENTS_TABLE_ID);

  const { coreAgents, isInitialLoading, error } = useCoreAgents({ tableId });

  const coreAgentsFilterSettings = useAtomStateValue(
    coreAgentsFilterSettingsState,
  );

  const { createCoreAgent, canCreateCoreAgent, isCreatingCoreAgent } =
    useCreateCoreAgent();

  const { selectedAgentIds, toggleRow, selectRows } = useCoreAgentsSelection({
    tableId,
    coreAgents,
  });
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();

  const hasError = isDefined(error);

  const isEmpty = !isInitialLoading && !hasError && coreAgents.length === 0;

  const hasAppliedFilters = hasAppliedCoreObjectFilters({
    filterSettings: coreAgentsFilterSettings,
    defaultFilterSettings: CORE_AGENTS_DEFAULT_FILTER_SETTINGS,
    filterFields: CORE_AGENT_FILTER_FIELDS,
  });

  return (
    <>
      <CoreAgentMetadataEventsEffect />
      <CoreAgentsSelectionCleanupEffect tableId={tableId} />
      <CoreObjectIndexPageLayout
        labelPlural={t`Agents`}
        icon={<CoreAgentsIcon size={theme.icon.size.md} />}
        numberOfSelectedRecords={selectedAgentIds.length}
        actionButton={
          <>
            {canCreateCoreAgent && selectedAgentIds.length === 0 && (
              <CommandMenuButton
                command={{
                  key: CORE_AGENTS_CREATE_COMMAND_ID,
                  label: t`Create agent`,
                  shortLabel: t`Create`,
                  Icon: IconPlus,
                }}
                onClick={createCoreAgent}
                loading={isCreatingCoreAgent}
                isPrimaryAction
              />
            )}
            <CoreAgentsDeleteButton
              tableId={tableId}
              selectedAgentIds={selectedAgentIds}
            />
            <CoreAgentsFilterButton isFilterActive={hasAppliedFilters} />
            <SidePanelToggleButton />
          </>
        }
        isInitialLoading={isInitialLoading}
        hasError={hasError}
        isEmpty={isEmpty}
        emptyState={{
          hasAppliedFilters,
          title: hasAppliedFilters
            ? t`No Agents found`
            : t`Add your first Agent`,
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
          selection={
            canCreateCoreAgent
              ? {
                  selectedRowIds: selectedAgentIds,
                  onToggleRow: toggleRow,
                  onToggleAllRows: selectRows,
                  isItemSelectable: getIsMetadataItemCustom,
                }
              : undefined
          }
        />
        {canCreateCoreAgent && (
          <CoreObjectTableAddNewRow
            label={t`New Agent`}
            onClick={createCoreAgent}
            disabled={isCreatingCoreAgent}
            hasCheckboxColumn
          />
        )}
      </CoreObjectIndexPageLayout>
    </>
  );
};
