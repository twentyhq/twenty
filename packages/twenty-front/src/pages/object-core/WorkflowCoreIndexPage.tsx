import { t } from '@lingui/core/macro';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { getCommandMenuIdFromRecordIndexId } from '@/command-menu-item/utils/getCommandMenuIdFromRecordIndexId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CoreObjectIndexPageLayout } from '@/object-core/components/CoreObjectIndexPageLayout';
import { CoreObjectTable } from '@/object-core/components/CoreObjectTable';
import { useCoreWorkflowsSelection } from '@/object-core/workflows/hooks/useCoreWorkflowsSelection';
import { useListenToCoreWorkflowEvents } from '@/object-core/workflows/hooks/useListenToCoreWorkflowEvents';
import { useCreateCoreWorkflow } from '@/object-core/workflows/hooks/useCreateCoreWorkflow';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { isUsableCoreWorkflowFilterRule } from '@/object-core/workflows/utils/isUsableCoreWorkflowFilterRule';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CoreWorkflowsFilterBar } from '@/object-core/workflows/components/CoreWorkflowsFilterBar';
import { CoreWorkflowsSelectionToContextStoreEffect } from '@/object-core/workflows/components/CoreWorkflowsSelectionToContextStoreEffect';
import { WORKFLOW_CORE_TABLE_COLUMNS } from '@/object-core/workflows/constants/WorkflowCoreTableColumns';
import {
  CORE_WORKFLOWS_INITIAL_SORT,
  CORE_WORKFLOWS_TABLE_ID,
  useCoreWorkflows,
} from '@/object-core/workflows/hooks/useCoreWorkflows';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';

const getCoreWorkflowLink = (workflow: CoreWorkflow) =>
  getAppPath(AppPath.WorkflowCoreShowPage, { coreWorkflowId: workflow.id });

export const WorkflowCoreIndexPage = () => {
  const tableId = useWorkspaceSurfaceScopedComponentInstanceId(
    CORE_WORKFLOWS_TABLE_ID,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const {
    coreWorkflows,
    hasNextPage,
    loading,
    isInitialLoading,
    error,
    fetchNextPage,
    refetchLoadedCoreWorkflows,
  } = useCoreWorkflows({ tableId });

  const { createCoreWorkflow, canCreateCoreWorkflow } = useCreateCoreWorkflow();

  const {
    displayedCoreWorkflows,
    selectedRowIds,
    selectedCoreWorkflows,
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
      labelPlural={objectMetadataItem.labelPlural}
      icon={<ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />}
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
          ? t`No ${objectMetadataItem.labelPlural} found`
          : t`Add your first ${objectMetadataItem.labelSingular}`,
        subTitle: hasAppliedFilters
          ? t`No ${objectMetadataItem.labelPlural} match your filters. Try removing some of them.`
          : t`Create a ${objectMetadataItem.labelSingular} to automate your work.`,
        buttonTitle: t`Add a ${objectMetadataItem.labelSingular}`,
        onButtonClick: canCreateCoreWorkflow ? createCoreWorkflow : undefined,
      }}
      hasNextPage={hasNextPage}
      isFetchingNextPage={loading}
      onFetchNextPage={fetchNextPage}
    >
      <CoreWorkflowsSelectionToContextStoreEffect
        selectedCoreWorkflows={selectedCoreWorkflows}
      />
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
    </CoreObjectIndexPageLayout>
  );
};
