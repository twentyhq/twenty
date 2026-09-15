import { type Workflow } from '@/workflow/types/Workflow';

export const getCurrentWorkflowVersionId = (
  workflow: Workflow,
): string | undefined => {
  const draftVersion = workflow.versions.find(
    (version) => version.status === 'DRAFT',
  );

  const sortedVersions = workflow.versions.toSorted((a, b) =>
    a.createdAt > b.createdAt ? -1 : 1,
  );

  const latestVersion = sortedVersions[0];

  return (draftVersion ?? latestVersion)?.id;
};
