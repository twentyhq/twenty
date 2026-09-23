import { type WorkflowVersionContent } from '@/workflow/workflow-version/hooks/useWorkflowVersionContent';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const isWorkflowDiagramSeedCurrent = ({
  seededVersionId,
  seededVersionUpdatedAt,
  seededContent,
  content,
  contentUpdatedAt,
}: {
  seededVersionId: string | undefined;
  seededVersionUpdatedAt: string | undefined;
  seededContent: WorkflowVersionContent | undefined;
  content: WorkflowVersionContent;
  contentUpdatedAt: string | undefined;
}): boolean =>
  seededVersionId === content.workflowVersionId &&
  (seededVersionUpdatedAt === contentUpdatedAt ||
    isDeeplyEqual(seededContent, content));
