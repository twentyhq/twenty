import { useEffect } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useInView } from 'react-intersection-observer';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';

import { CoreObjectTable } from '@/object-core/components/CoreObjectTable';
import { CoreObjectTableAddNewRow } from '@/object-core/components/CoreObjectTableAddNewRow';
import { useCreateCoreWorkflow } from '@/object-core/workflows/hooks/useCreateCoreWorkflow';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { isUsableCoreWorkflowFilterRule } from '@/object-core/workflows/utils/isUsableCoreWorkflowFilterRule';
import { RecordIndexEmptyStateDisplay } from '@/object-record/record-index/components/RecordIndexEmptyStateDisplay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CoreWorkflowsFilterBar } from '@/object-core/workflows/components/CoreWorkflowsFilterBar';
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
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';

const StyledTableContainer = styled.div`
  height: 100%;
  overflow: auto;
  width: 100%;
`;

const StyledFetchMoreSentinel = styled.div`
  height: 1px;
`;

const getCoreWorkflowLink = (workflow: CoreWorkflow) =>
  isDefined(workflow.workspaceWorkflowId)
    ? getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: workflow.workspaceWorkflowId,
      })
    : undefined;

export const WorkflowCoreIndexPage = () => {
  const tableId = useWorkspaceSurfaceScopedComponentInstanceId(
    CORE_WORKFLOWS_TABLE_ID,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const { coreWorkflows, hasNextPage, loading, fetchNextPage } =
    useCoreWorkflows({ tableId });

  const { ref: fetchMoreRef, inView } = useInView();

  const { t } = useLingui();

  const { createCoreWorkflow, canCreateCoreWorkflow } = useCreateCoreWorkflow();

  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  const hasAppliedFilters = (
    coreWorkflowsFilterSettings.stepFilters ?? []
  ).some(isUsableCoreWorkflowFilterRule);

  const isEmpty = !loading && coreWorkflows.length === 0;

  useEffect(() => {
    if (inView && hasNextPage && !loading) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, loading, fetchNextPage]);

  return (
    <>
      <PageTitle title={objectMetadataItem.labelPlural} />
      <PageCardLayout
        header={
          <PageCardHeader
            icon={
              <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
            }
            title={objectMetadataItem.labelPlural}
            actionButton={
              <>
                <CoreWorkflowsFilterBar />
                <SidePanelToggleButton />
              </>
            }
          />
        }
      >
        <StyledTableContainer>
          {isEmpty ? (
            <RecordIndexEmptyStateDisplay
              animatedPlaceholderType={
                hasAppliedFilters ? 'noMatchRecord' : 'noRecord'
              }
              title={
                hasAppliedFilters
                  ? t`No ${objectMetadataItem.labelPlural} found`
                  : t`Add your first ${objectMetadataItem.labelSingular}`
              }
              subTitle={
                hasAppliedFilters
                  ? t`No ${objectMetadataItem.labelPlural} match your filters. Try removing some of them.`
                  : t`Create a workflow to automate your work.`
              }
              ButtonIcon={IconPlus}
              buttonTitle={t`Add a ${objectMetadataItem.labelSingular}`}
              onButtonClick={
                canCreateCoreWorkflow ? createCoreWorkflow : undefined
              }
            />
          ) : (
            <>
              <CoreObjectTable
                tableId={tableId}
                columns={WORKFLOW_CORE_TABLE_COLUMNS}
                items={coreWorkflows}
                getItemKey={(workflow) => workflow.id}
                getItemLink={getCoreWorkflowLink}
                initialSort={CORE_WORKFLOWS_INITIAL_SORT}
              />
              {canCreateCoreWorkflow && (
                <CoreObjectTableAddNewRow
                  label={t`New ${objectMetadataItem.labelSingular}`}
                  onClick={createCoreWorkflow}
                />
              )}
              {hasNextPage && <StyledFetchMoreSentinel ref={fetchMoreRef} />}
            </>
          )}
        </StyledTableContainer>
      </PageCardLayout>
    </>
  );
};
