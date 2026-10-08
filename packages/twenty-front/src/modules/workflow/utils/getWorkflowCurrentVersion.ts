type WorkflowVersionForCurrentSelection = {
  id: string;
  createdAt: string;
  status: string;
};

export const getWorkflowCurrentVersion = <
  TWorkflowVersion extends WorkflowVersionForCurrentSelection,
>({
  versions,
  lastPublishedVersionId,
}: {
  versions: TWorkflowVersion[];
  lastPublishedVersionId: string | null | undefined;
}): TWorkflowVersion | undefined => {
  const versionsByRecency = versions.toSorted((firstVersion, secondVersion) =>
    secondVersion.createdAt.localeCompare(firstVersion.createdAt),
  );

  return (
    versionsByRecency.find(({ status }) => status === 'DRAFT') ??
    versionsByRecency.find(({ status }) => status === 'ACTIVE') ??
    versionsByRecency.find(({ id }) => id === lastPublishedVersionId) ??
    versionsByRecency[0]
  );
};
