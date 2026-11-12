import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';

import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { getCommandMenuIdFromRecordIndexId } from '@/command-menu-item/utils/getCommandMenuIdFromRecordIndexId';
import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { CoreAgentIcon } from '@/object-core/agents/components/CoreAgentIcon';
import { CoreAgentsSelectionResetEffect } from '@/object-core/agents/components/CoreAgentsSelectionResetEffect';
import { CoreAgentsFilterButton } from '@/object-core/agents/components/CoreAgentsFilterButton';
import { CORE_AGENT_TABLE_COLUMNS } from '@/object-core/agents/constants/CoreAgentTableColumns';
import { CORE_AGENT_FILTER_FIELDS } from '@/object-core/agents/constants/CoreAgentFilterFields';
import { CORE_AGENTS_DEFAULT_FILTER_SETTINGS } from '@/object-core/agents/constants/CoreAgentsDefaultFilterSettings';
import {
  CORE_AGENTS_INITIAL_SORT,
  CORE_AGENTS_TABLE_ID,
  useCoreAgents,
} from '@/object-core/agents/hooks/useCoreAgents';
import { useCoreAgentsSelection } from '@/object-core/agents/hooks/useCoreAgentsSelection';
import { useCreateCoreAgent } from '@/object-core/agents/hooks/useCreateCoreAgent';
import { useListenToCoreAgentEvents } from '@/object-core/agents/hooks/useListenToCoreAgentEvents';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { CoreAgentPinnedCommandMenuItems } from '@/object-core/commands/components/CoreAgentPinnedCommandMenuItems';
import { CORE_AGENTS_CREATE_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsCreateCommandId';
import { CoreObjectIndexPageLayout } from '@/object-core/components/CoreObjectIndexPageLayout';
import { CoreObjectTable } from '@/object-core/components/CoreObjectTable';
import { CoreObjectTableAddNewRow } from '@/object-core/components/CoreObjectTableAddNewRow';
import { hasAppliedCoreObjectFilters } from '@/object-core/filters/utils/hasAppliedCoreObjectFilters';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';

const getCoreAgentItemLink = (agent: CoreAgent) => getCoreAgentLink(agent.id);

export const AgentCoreIndexPage = () => {
  const { t } = useLingui();

  const tableId =
    useWorkspaceSurfaceScopedComponentInstanceId(CORE_AGENTS_TABLE_ID);

  const { coreAgents, refetchCoreAgents, isInitialLoading, error } =
    useCoreAgents({ tableId });

  useListenToCoreAgentEvents({ refetch: refetchCoreAgents });

  const coreAgentsFilterSettings = useAtomStateValue(
    coreAgentsFilterSettingsState,
  );

  const { createCoreAgent, canCreateCoreAgent, isCreatingCoreAgent } =
    useCreateCoreAgent();

  const { selectedRowIds, selectedRowCount, toggleRow, selectRows } =
    useCoreAgentsSelection({ coreAgents });

  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();

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
      icon={<CoreAgentIcon size={16} />}
      numberOfSelectedRecords={selectedRowCount}
      actionButton={
        <>
          {canCreateCoreAgent && selectedRowCount === 0 && (
            <CommandMenuButton
              command={{
                key: CORE_AGENTS_CREATE_COMMAND_ID,
                label: t`Create Agent`,
                shortLabel: t`Create`,
                Icon: IconPlus,
              }}
              onClick={createCoreAgent}
              loading={isCreatingCoreAgent}
              isPrimaryAction
            />
          )}
          <CoreAgentPinnedCommandMenuItems
            commandMenuInstanceId={getCommandMenuIdFromRecordIndexId(tableId)}
            containerType={CommandMenuItemContainerType.IndexPageHeader}
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
        title: hasAppliedFilters ? t`No Agents found` : t`Add your first Agent`,
        subTitle: hasAppliedFilters
          ? t`No Agents match your filters. Try removing some of them.`
          : t`Create an Agent to automate your work.`,
        buttonTitle: t`Add an Agent`,
        onButtonClick: canCreateCoreAgent ? createCoreAgent : undefined,
      }}
    >
      <CoreAgentsSelectionResetEffect />
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
                selectedRowIds,
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
  );
};
