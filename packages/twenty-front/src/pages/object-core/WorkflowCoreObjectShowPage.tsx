import { type CoreObjectShowPageProps } from '@/object-core/types/CoreObjectShowPageProps';
import { WorkspaceWorkflowRedirect } from '@/object-core/workflows/components/WorkspaceWorkflowRedirect';

type WorkflowCoreObjectShowPageProps = CoreObjectShowPageProps;

export const WorkflowCoreObjectShowPage = ({
  objectRecordId,
}: WorkflowCoreObjectShowPageProps) => (
  <WorkspaceWorkflowRedirect workspaceWorkflowId={objectRecordId} />
);
