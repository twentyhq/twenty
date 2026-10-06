import { t } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconSettingsAutomation } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { getCommandMenuIdFromRecordIndexId } from '@/command-menu-item/utils/getCommandMenuIdFromRecordIndexId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CoreObjectIndexPageLayout } from '@/object-core/components/CoreObjectIndexPageLayout';
import { CoreObjectTable } from '@/object-core/components/CoreObjectTable';
import { CoreObjectTableAddNewRow } from '@/object-core/components/CoreObjectTableAddNewRow';
import { useCoreWorkflowsSelection } from '@/object-core/workflows/hooks/useCoreWorkflowsSelection';
import { useListenToCoreWorkflowEvents } from '@/object-core/workflows/hooks/useListenToCoreWorkflowEvents';
import { useCreateCoreWorkflow } from '@/object-core/workflows/hooks/useCreateCoreWorkflow';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { isUsableCoreWorkflowFilterRule } from '@/object-core/workflows/utils/isUsableCoreWorkflowFilterRule';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CoreWorkflowsFilterBar } from '@/object-core/workflows/components/CoreWorkflowsFilterBar';
import { WORKFLOW_CORE_TABLE_COLUMNS } from '@/object-core/workflows/constants/WorkflowCoreTableColumns';
import {
  CORE_WORKFLOWS_INITIAL_SORT,
  CORE_WORKFLOWS_TABLE_ID,
  useCoreWorkflows,
} from '@/object-core/workflows/hooks/useCoreWorkflows';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';

const getCoreWorkflowLink = (workflow: CoreWorkflow) =>
  getAppPath(AppPath.WorkflowCoreShowPage, { coreWorkflowId: workflow.id });

const WorkflowCoreIndexPageContent = () => {
  const tableId = useWorkspaceSurfaceScopedComponentInstanceId(
    CORE_WORKFLOWS_TABLE_ID,
  );

  const theme = useTheme();

  const {
    coreWorkflows,
    hasNextPage,
    loading,
    isInitialLoading,
    error,
    fetchNextPage,
    refetchLoadedCoreWorkflows,
  } = useCoreWorkflows({ tableId });

  const { createCoreWorkflow, canCreateCoreWorkflow, isCreatingCoreWorkflow } =
    useCreateCoreWorkflow();

  const {
    displayedCoreWorkflows,
    selectedRowIds,
    selectedRowCount,
    toggleRow,
    selectRows,
  } = useCoreWorkflowsSelection({ coreWorkflows });

  useListenToCoreWorkflowEvents({ refetch: refetchLoadedCoreWorkflows });

  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  const hasAppliedFilters = (
    coreWorkflowsFilterSettings.stepFilters ?? []
  ).some(isUsableCoreWorkflowFilterRule);

  const hasError = isDefined(error);

  const isEmpty =
    !isInitialLoading &&
    !hasError &&
    !hasNextPage &&
    displayedCoreWorkflows.length === 0;

  return (
    <CoreObjectIndexPageLayout
      labelPlural={t`Workflows`}
      icon={
        <IconSettingsAutomation
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      }
      numberOfSelectedRecords={selectedRowCount}
      actionButton={
        <>
          <CommandMenuComponentInstanceContext.Provider
            value={{
              instanceId: getCommandMenuIdFromRecordIndexId(tableId),
            }}
          >
            <CommandMenuContextProvider
              displayType="button"
              containerType={CommandMenuItemContainerType.IndexPageHeader}
            >
              <PinnedCommandMenuItemButtons />
            </CommandMenuContextProvider>
          </CommandMenuComponentInstanceContext.Provider>
          <CoreWorkflowsFilterBar />
          <SidePanelToggleButton />
        </>
      }
      isInitialLoading={isInitialLoading}
      hasError={hasError}
      isEmpty={isEmpty}
      emptyState={{
        hasAppliedFilters,
        title: hasAppliedFilters
          ? t`No Workflows found`
          : t`Add your first Workflow`,
        subTitle: hasAppliedFilters
          ? t`No Workflows match your filters. Try removing some of them.`
          : t`Create a Workflow to automate your work.`,
        buttonTitle: t`Add a Workflow`,
        onButtonClick: canCreateCoreWorkflow ? createCoreWorkflow : undefined,
      }}
      hasNextPage={hasNextPage}
      isFetchingNextPage={loading}
      onFetchNextPage={fetchNextPage}
    >
      <CoreObjectTable
        tableId={tableId}
        columns={WORKFLOW_CORE_TABLE_COLUMNS}
        items={displayedCoreWorkflows}
        getItemKey={(workflow) => workflow.id}
        getItemLink={getCoreWorkflowLink}
        initialSort={CORE_WORKFLOWS_INITIAL_SORT}
        selection={{
          selectedRowIds,
          onToggleRow: toggleRow,
          onToggleAllRows: selectRows,
        }}
      />
      {canCreateCoreWorkflow && (
        <CoreObjectTableAddNewRow
          label={t`New Workflow`}
          onClick={createCoreWorkflow}
          disabled={isCreatingCoreWorkflow}
        />
      )}
    </CoreObjectIndexPageLayout>
  );
};

export const WorkflowCoreIndexPage = () => {
  const canManageWorkflows = useHasPermissionFlag(PermissionFlagType.WORKFLOWS);

  if (!canManageWorkflows) {
    return (
      <WorkspaceRouteUnavailable>{t`You do not have permission to access workflows.`}</WorkspaceRouteUnavailable>
    );
  }

  return <WorkflowCoreIndexPageContent />;
};
