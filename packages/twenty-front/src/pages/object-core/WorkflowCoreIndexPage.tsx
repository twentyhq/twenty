import { useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { plural, t } from '@lingui/core/macro';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

import { CoreObjectTable } from '@/object-core/components/CoreObjectTable';
import { DELETE_CORE_WORKFLOWS_MODAL_ID } from '@/object-core/workflows/constants/DeleteCoreWorkflowsModalId';
import { useDeleteCoreWorkflows } from '@/object-core/workflows/hooks/useDeleteCoreWorkflows';
import { toggleRowIdInSelection } from '@/object-core/utils/toggleRowIdInSelection';
import { getSelectedWorkspaceWorkflowIds } from '@/object-core/workflows/utils/getSelectedWorkspaceWorkflowIds';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
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

  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  const [deletedWorkspaceWorkflowIds, setDeletedWorkspaceWorkflowIds] =
    useState<string[]>([]);

  const { openModal } = useModal();

  const {
    deleteCoreWorkflows,
    canDeleteCoreWorkflows,
    isDeletingCoreWorkflows,
  } = useDeleteCoreWorkflows();

  const displayedCoreWorkflows = coreWorkflows.filter(
    (coreWorkflow) =>
      !isDefined(coreWorkflow.workspaceWorkflowId) ||
      !deletedWorkspaceWorkflowIds.includes(coreWorkflow.workspaceWorkflowId),
  );

  const selectedWorkspaceWorkflowIds = getSelectedWorkspaceWorkflowIds({
    coreWorkflows: displayedCoreWorkflows,
    selectedRowIds,
  });

  const handleDeleteConfirm = async () => {
    const workspaceWorkflowIdsToDelete = selectedWorkspaceWorkflowIds;

    const hasDeleted = await deleteCoreWorkflows(workspaceWorkflowIdsToDelete);

    if (!hasDeleted) {
      return;
    }

    setDeletedWorkspaceWorkflowIds((previousDeletedWorkspaceWorkflowIds) => [
      ...previousDeletedWorkspaceWorkflowIds,
      ...workspaceWorkflowIdsToDelete,
    ]);
    setSelectedRowIds([]);
  };

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
                {canDeleteCoreWorkflows &&
                  selectedWorkspaceWorkflowIds.length > 0 && (
                    <Button
                      Icon={IconTrash}
                      title={t`Delete`}
                      accent="danger"
                      size="small"
                      disabled={isDeletingCoreWorkflows}
                      onClick={() => openModal(DELETE_CORE_WORKFLOWS_MODAL_ID)}
                    />
                  )}
                <CoreWorkflowsFilterBar />
                <SidePanelToggleButton />
              </>
            }
          />
        }
      >
        <StyledTableContainer>
          <CoreObjectTable
            tableId={tableId}
            columns={WORKFLOW_CORE_TABLE_COLUMNS}
            items={displayedCoreWorkflows}
            getItemKey={(workflow) => workflow.id}
            getItemLink={getCoreWorkflowLink}
            initialSort={CORE_WORKFLOWS_INITIAL_SORT}
            selection={
              canDeleteCoreWorkflows
                ? {
                    selectedRowIds,
                    onToggleRow: (rowId) =>
                      setSelectedRowIds((previousSelectedRowIds) =>
                        toggleRowIdInSelection({
                          selectedRowIds: previousSelectedRowIds,
                          rowId,
                        }),
                      ),
                    onToggleAllRows: setSelectedRowIds,
                    isItemSelectable: (coreWorkflow) =>
                      isDefined(coreWorkflow.workspaceWorkflowId),
                  }
                : undefined
            }
          />
          {hasNextPage && <StyledFetchMoreSentinel ref={fetchMoreRef} />}
          <ConfirmationModal
            modalInstanceId={DELETE_CORE_WORKFLOWS_MODAL_ID}
            title={plural(selectedWorkspaceWorkflowIds.length, {
              one: 'Delete 1 workflow?',
              other: 'Delete # workflows?',
            })}
            subtitle={plural(selectedWorkspaceWorkflowIds.length, {
              one: 'This workflow and its run history will no longer be listed.',
              other:
                'These workflows and their run history will no longer be listed.',
            })}
            onConfirmClick={handleDeleteConfirm}
            confirmButtonText={t`Delete`}
          />
        </StyledTableContainer>
      </PageCardLayout>
    </>
  );
};
