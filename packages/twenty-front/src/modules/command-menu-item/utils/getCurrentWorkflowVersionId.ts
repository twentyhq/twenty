import { type Workflow } from '@/workflow/types/Workflow';

export const getCurrentWorkflowVersionId = (
  workflow: Workflow,
): string | undefined => {
  const versionsFromNewest = workflow.versions.toSorted((a, b) =>
    a.createdAt > b.createdAt ? -1 : 1,
  );

  const newestDraftVersion = versionsFromNewest.find(
    (version) => version.status === 'DRAFT',
  );

  return (newestDraftVersion ?? versionsFromNewest[0])?.id;
};
