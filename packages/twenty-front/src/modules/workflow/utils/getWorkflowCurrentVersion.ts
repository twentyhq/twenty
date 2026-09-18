type WorkflowVersionForCurrentSelection = {
  createdAt: string;
  status: string;
};

export const getWorkflowCurrentVersion = <
  TWorkflowVersion extends WorkflowVersionForCurrentSelection,
>(
  versions: TWorkflowVersion[],
): TWorkflowVersion | undefined => {
  const versionsByRecency = versions.toSorted((firstVersion, secondVersion) =>
    secondVersion.createdAt.localeCompare(firstVersion.createdAt),
  );

  return (
    versionsByRecency.find(({ status }) => status === 'DRAFT') ??
    versionsByRecency.find(({ status }) => status === 'ACTIVE') ??
    versionsByRecency[0]
  );
};
