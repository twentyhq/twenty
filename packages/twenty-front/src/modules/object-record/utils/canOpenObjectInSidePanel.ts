export const canOpenObjectInSidePanel = (objectNameSingular: string) =>
  !(
    objectNameSingular === 'workflow' ||
    objectNameSingular === 'workflowVersion'
  );
