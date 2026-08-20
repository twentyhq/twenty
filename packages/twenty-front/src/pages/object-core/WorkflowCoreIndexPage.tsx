import { styled } from '@linaria/react';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { CoreObjectTable } from '@/object-core/components/CoreObjectTable';
import { WORKFLOW_CORE_TABLE_COLUMNS } from '@/object-core/workflows/constants/WorkflowCoreTableColumns';
import {
  CORE_WORKFLOWS_INITIAL_SORT,
  CORE_WORKFLOWS_TABLE_ID,
  useCoreWorkflows,
} from '@/object-core/workflows/hooks/useCoreWorkflows';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';

const StyledTableContainer = styled.div`
  height: 100%;
  overflow: auto;
  width: 100%;
`;

const getCoreWorkflowLink = (workflow: CoreWorkflow) =>
  isDefined(workflow.workspaceWorkflowId)
    ? getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: workflow.workspaceWorkflowId,
      })
    : undefined;

export const WorkflowCoreIndexPage = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const { coreWorkflows } = useCoreWorkflows();

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
          />
        }
      >
        <StyledTableContainer>
          <CoreObjectTable
            tableId={CORE_WORKFLOWS_TABLE_ID}
            columns={WORKFLOW_CORE_TABLE_COLUMNS}
            items={coreWorkflows}
            getItemKey={(workflow) => workflow.id}
            getItemLink={getCoreWorkflowLink}
            initialSort={CORE_WORKFLOWS_INITIAL_SORT}
          />
        </StyledTableContainer>
      </PageCardLayout>
    </>
  );
};
